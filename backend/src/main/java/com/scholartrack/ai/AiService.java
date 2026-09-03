package com.scholartrack.ai;

import com.scholartrack.academic.*;
import com.scholartrack.activity.*;
import com.scholartrack.ai.AiDtos.*;
import com.scholartrack.common.ApiException;
import com.scholartrack.user.User;
import com.scholartrack.user.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * AI assistant service:
 *  - Rule-based academic risk identification with explainable reasons.
 *  - AI study plan generation from real performance data.
 *  - AI chat engine (prompt-engineered course advisory).
 *  - Chat history persistence.
 *
 * All AI generation is rule-based (no external LLM key needed), ensuring
 * reliability and no secret exposure. Responses mirror what an LLM would say
 * but are computed deterministically from the student's actual data.
 */
@Service
public class AiService {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private final AiChatMessageRepository chatRepo;
    private final StudentRepository students;
    private final AttendanceRepository attendance;
    private final MarkRepository marks;
    private final SubjectRepository subjects;
    private final SemesterResultRepository semesterResults;
    private final TeacherAssignmentRepository assignments;
    private final UserRepository users;

    public AiService(AiChatMessageRepository chatRepo, StudentRepository students,
                     AttendanceRepository attendance, MarkRepository marks,
                     SubjectRepository subjects, SemesterResultRepository semesterResults,
                     TeacherAssignmentRepository assignments, UserRepository users) {
        this.chatRepo = chatRepo; this.students = students;
        this.attendance = attendance; this.marks = marks;
        this.subjects = subjects; this.semesterResults = semesterResults;
        this.assignments = assignments; this.users = users;
    }

    // ─── Academic risk identification ─────────────────────────────────────────

    @Transactional(readOnly = true)
    public RiskDetail studentRisk(String username) {
        Student s = studentForUser(username);
        return computeRisk(s);
    }

    @Transactional(readOnly = true)
    public RiskDetail studentRiskById(Long studentId) {
        Student s = students.findById(studentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Student not found"));
        return computeRisk(s);
    }

    private RiskDetail computeRisk(Student s) {
        // Attendance component
        List<Object[]> attRows = attendance.countBySubject(s.getId());
        long totalAtt = 0, presentAtt = 0;
        for (Object[] r : attRows) {
            totalAtt += (Long) r[1];
            presentAtt += ((Number) r[2]).longValue();
        }
        double attPct = totalAtt == 0 ? 100.0 : AcademicCalc.attendancePercent((int) presentAtt, (int) totalAtt);
        int attRisk = totalAtt < 5 ? 0 : attPct < 60 ? 40 : attPct < 75 ? 25 : 0;

        // Marks component
        List<Object[]> markRows = marks.totalsByStudentSubject();
        double sumEarned = 0, sumMax = 0;
        for (Object[] r : markRows) {
            if (((Long) r[0]).equals(s.getId())) {
                sumEarned += ((BigDecimal) r[2]).doubleValue();
                sumMax += ((BigDecimal) r[3]).doubleValue();
            }
        }
        double markPct = sumMax == 0 ? 100.0 : AcademicCalc.percentage(sumEarned, sumMax);
        int markRisk = sumMax == 0 ? 0 : markPct < 35 ? 35 : markPct < 50 ? 20 : markPct < 60 ? 10 : 0;

        // Semester result trend – use large semesterNo to get all records
        List<com.scholartrack.activity.SemesterResult> prevResults =
                semesterResults.findByStudentIdAndSemesterNoLessThanOrderBySemesterNo(s.getId(), 99);
        double sgpaTrend = 0;
        int trendRisk = 0;
        if (prevResults.size() >= 2) {
            double last = prevResults.get(prevResults.size() - 1).getSgpa().doubleValue();
            double prev = prevResults.get(prevResults.size() - 2).getSgpa().doubleValue();
            sgpaTrend = AcademicCalc.round2(last - prev);
            if (sgpaTrend < -1.0) trendRisk = 25;
            else if (sgpaTrend < -0.5) trendRisk = 12;
        }

        int totalScore = attRisk + markRisk + trendRisk;
        String level = totalScore >= 50 ? "HIGH" : totalScore >= 25 ? "MEDIUM" : "LOW";

        List<RiskComponent> components = new ArrayList<>();
        components.add(new RiskComponent("Attendance", attPct, attRisk, 40,
                totalScore == 0 ? 0 : (double) attRisk / 100));
        components.add(new RiskComponent("Marks", markPct, markRisk, 35,
                totalScore == 0 ? 0 : (double) markRisk / 100));
        components.add(new RiskComponent("SGPA Trend", sgpaTrend, trendRisk, 25,
                totalScore == 0 ? 0 : (double) trendRisk / 100));

        List<String> reasons = new ArrayList<>();
        if (totalAtt >= 5 && attPct < 75)
            reasons.add(String.format("Overall attendance is %.1f%% – below the mandatory 75%% threshold. Risk of debarment from exams.", attPct));
        if (sumMax > 0 && markPct < 50)
            reasons.add(String.format("Average marks across all assessments: %.1f%%. Passing requires ≥40%%; higher is needed for good grades.", markPct));
        if (prevResults.size() >= 2 && sgpaTrend < -0.5)
            reasons.add(String.format("SGPA has dropped by %.2f points since last semester – a declining academic trend.", Math.abs(sgpaTrend)));
        if (reasons.isEmpty()) reasons.add("Academic indicators are within acceptable ranges. Keep up the good work!");

        return new RiskDetail(s.getId(), s.getRollNo(), s.getUser().getFullName(),
                new RiskPayload(totalScore, level, components, reasons));
    }

    // ─── Study plan generation ────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public StudyPlanDto generateStudyPlan(String username) {
        Student s = studentForUser(username);
        List<TeacherAssignment> tas = assignments.findByClassGroupId(s.getClassGroup().getId());

        // Build per-subject attendance
        List<Object[]> attRows = attendance.countBySubject(s.getId());
        Map<Long, double[]> attBySubject = new HashMap<>(); // subjectId -> [attended, total]
        for (Object[] r : attRows) {
            attBySubject.put((Long) r[0], new double[]{((Number) r[2]).doubleValue(), (Long) r[1]});
        }

        // Build per-subject marks
        List<Object[]> markRows = marks.totalsByStudentSubject();
        Map<Long, double[]> markBySubject = new HashMap<>();
        for (Object[] r : markRows) {
            if (((Long) r[0]).equals(s.getId())) {
                Long subId = (Long) r[1];
                double earned = ((BigDecimal) r[2]).doubleValue();
                double max = ((BigDecimal) r[3]).doubleValue();
                markBySubject.put(subId, new double[]{earned, max});
            }
        }

        Set<Long> seen = new HashSet<>();
        List<StudyPlanSubject> planSubjects = new ArrayList<>();
        for (TeacherAssignment ta : tas) {
            Subject sub = ta.getSubject();
            if (!seen.add(sub.getId())) continue;

            double[] att = attBySubject.get(sub.getId());
            double attPct = att != null && att[1] > 0 ? AcademicCalc.attendancePercent((int) att[0], (int) att[1]) : 100.0;
            double[] mk = markBySubject.get(sub.getId());
            double markPct = mk != null && mk[1] > 0 ? AcademicCalc.percentage(mk[0], mk[1]) : 100.0;

            String priority = (attPct < 75 || markPct < 40) ? "HIGH"
                    : (attPct < 85 || markPct < 60) ? "MEDIUM" : "LOW";
            int hours = "HIGH".equals(priority) ? 6 : "MEDIUM".equals(priority) ? 4 : 2;

            List<String> actions = new ArrayList<>();
            if (attPct < 75) actions.add(String.format("Attend all upcoming classes – need %d more to reach 75%%",
                    AcademicCalc.classesNeededFor75((int) (att == null ? 0 : att[0]), (int) (att == null ? 0 : att[1]))));
            if (markPct < 40) actions.add("Revise all unit topics and practice past paper questions");
            if (markPct >= 40 && markPct < 60) actions.add("Focus on weaker units identified in last midterm");
            actions.add("Review " + sub.getCode() + " course objectives and create a topic checklist");
            if ("HIGH".equals(priority)) actions.add("Schedule weekly meetings with your subject teacher for doubt clearing");

            planSubjects.add(new StudyPlanSubject(sub.getCode(), sub.getName(),
                    AcademicCalc.round2(attPct), AcademicCalc.round2(markPct), priority, hours, actions));
        }
        planSubjects.sort(Comparator.comparing(StudyPlanSubject::priority));

        List<String> advice = new ArrayList<>();
        boolean hasHighRisk = planSubjects.stream().anyMatch(p -> "HIGH".equals(p.priority()));
        if (hasHighRisk) {
            advice.add("⚠️ You have high-priority subjects that need immediate attention. Focus on these first.");
            advice.add("Create a daily timetable dedicating at least 2 hours to high-priority subjects.");
        }
        advice.add("Use the Pomodoro technique: 25 minutes focused study followed by a 5-minute break.");
        advice.add("Form a peer study group for subjects where you feel least confident.");
        advice.add("Review the syllabus page regularly to track your completion progress.");

        return new StudyPlanDto(s.getUser().getFullName(), s.getRollNo(),
                LocalDateTime.now().format(FMT), planSubjects, advice);
    }

    // ─── AI chat ─────────────────────────────────────────────────────────────

    @Transactional
    public ChatReply chat(String username, ChatRequest req) {
        User u = userForUsername(username);
        String sessionId = (req.sessionId() != null && !req.sessionId().isBlank())
                ? req.sessionId() : UUID.randomUUID().toString();

        // Validate input
        String userMsg = req.message().trim();

        // Persist user turn
        chatRepo.save(new AiChatMessage(u.getId(), sessionId, "USER", userMsg));

        // Build context-aware reply
        String reply = buildReply(u, userMsg);

        // Persist assistant turn
        chatRepo.save(new AiChatMessage(u.getId(), sessionId, "ASSISTANT", reply));

        return new ChatReply(reply, sessionId, LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public List<HistoryItem> chatHistory(String username) {
        User u = userForUsername(username);
        return chatRepo.findByUserIdOrderByCreatedAtAsc(u.getId()).stream()
                .map(m -> new HistoryItem(m.getId(), m.getSender(), m.getContent(), m.getCreatedAt()))
                .toList();
    }

    @Transactional
    public void clearHistory(String username, String sessionId) {
        User u = userForUsername(username);
        if (sessionId != null && !sessionId.isBlank()) {
            chatRepo.deleteByUserIdAndSessionId(u.getId(), sessionId);
        } else {
            chatRepo.deleteAll(chatRepo.findByUserIdOrderByCreatedAtAsc(u.getId()));
        }
    }

    // ─── Prompt engineering / rule-based response engine ─────────────────────

    private String buildReply(User u, String userMsg) {
        String lower = userMsg.toLowerCase();

        // Attendance queries
        if (lower.contains("attendance")) {
            if (lower.contains("improv") || lower.contains("increas") || lower.contains("boos")) {
                return """
                        To improve your attendance:
                        1. Set a daily alarm 15 minutes before your first class.
                        2. Mark all your subject schedules in a calendar app.
                        3. Talk to your teacher if you had genuine medical absences — they may grant attendance relaxation.
                        4. Check the Attendance page on ScholarTrack to see exactly how many more classes you need.
                        The attendance threshold is **75%**. Classes needed to reach it is shown per subject.""";
            }
            return "Your attendance details are available on the **Attendance** page. "
                    + "The system highlights any subject where you're below 75% and tells you how many classes you need to attend to get back on track.";
        }

        // Marks/grades
        if (lower.contains("mark") || lower.contains("grade") || lower.contains("cgpa") || lower.contains("sgpa")) {
            return """
                    Your marks and SGPA/CGPA are displayed on the **Marks & Results** page.

                    Tips to improve your academic performance:
                    - Focus on subjects where your grade point is 0 (fail) or low (4–5).
                    - Each 10% improvement in marks moves you one grade point up.
                    - Use the AI Study Plan (ask me: "generate my study plan") for a personalised improvement roadmap.
                    - Discuss specific topics with your teacher through the Notices or Complaints channel.""";
        }

        // Study plan
        if (lower.contains("study plan") || lower.contains("study schedule") || lower.contains("how to study")) {
            return "I can generate a personalised study plan based on your attendance and marks data. "
                    + "Go to the **AI Assistant** page and click **Generate Study Plan**, or ask me: \"generate my study plan\".";
        }

        // Fees
        if (lower.contains("fee") || lower.contains("payment") || lower.contains("due")) {
            return "Your fee ledger, payment history, and any outstanding dues are shown on the **Fees** page. "
                    + "If you believe there is an error, raise a grievance on the **Complaints** page with category FEES.";
        }

        // Syllabus
        if (lower.contains("syllabus") || lower.contains("topic") || lower.contains("unit")) {
            return "The **Syllabus** page shows each subject's topic checklist and your progress percentage. "
                    + "Topics are marked complete by your teacher after they are covered in class.";
        }

        // Complaints
        if (lower.contains("complaint") || lower.contains("grievance") || lower.contains("issue")) {
            return "To raise a concern, go to the **Complaints** page and submit a new grievance. "
                    + "Select the appropriate category (Academic, Attendance, Fees, Facilities, or Other) and describe the issue. "
                    + "The HOD and assigned teacher will respond.";
        }

        // Assignments
        if (lower.contains("assignment") || lower.contains("submission") || lower.contains("deadline")) {
            return "All your current and past assignments are on the **Assignments** page. "
                    + "Pending assignments show a countdown to the deadline. "
                    + "Late submissions may still be accepted at the teacher's discretion — check for any feedback.";
        }

        // Risk
        if (lower.contains("risk") || lower.contains("at risk") || lower.contains("fail")) {
            return "The AI Risk panel on your **Dashboard** shows your academic risk score and the reasons behind it. "
                    + "A HIGH risk score means both your attendance and marks need immediate attention. "
                    + "Ask me: \"how do I improve my attendance\" or \"how can I improve my marks\" for targeted advice.";
        }

        // Help/greeting
        if (lower.contains("hello") || lower.contains("hi") || lower.contains("help") || lower.contains("what can you do")) {
            return String.format("""
                    Hello, %s! I'm your ScholarTrack AI Assistant. Here's what I can help you with:

                    📊 **Academic Performance** — Ask about your marks, SGPA, or CGPA trends.
                    📅 **Attendance** — Understand your attendance percentage and what you need to maintain.
                    📚 **Study Plan** — I can generate a personalised study plan based on your data.
                    💡 **Course Advisory** — Ask me how to improve in any subject or area.
                    📝 **Assignments** — Deadlines, submission tips, and feedback advice.
                    💬 **Complaints & Notices** — Guide you through the grievance process.

                    Just ask me anything about your academics!""", u.getFullName());
        }

        // Default
        return String.format("""
                I understand you're asking about: "%s"

                I'm specialised in academic advisory for ScholarTrack. Here are some things I can help with:
                - Check your **attendance** status and improvement steps
                - Review your **marks and results**
                - Generate a personalised **study plan**
                - Understand your **academic risk score**
                - Navigate **assignments, fees, notices, and complaints**

                Try asking: "How do I improve my attendance?" or "Generate my study plan".""", userMsg);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Student studentForUser(String username) {
        User u = userForUsername(username);
        return students.findByUserId(u.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Student profile not found"));
    }

    private User userForUsername(String username) {
        return users.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required"));
    }
}
