package com.scholartrack.report;

import com.scholartrack.academic.*;
import com.scholartrack.activity.*;
import com.scholartrack.activity.ActivityDtos.*;
import com.scholartrack.analytics.AnalyticsDtos.*;
import com.scholartrack.analytics.AnalyticsService;
import com.scholartrack.common.ApiException;
import com.scholartrack.fee.FeeDtos.*;
import com.scholartrack.fee.FeeService;
import com.scholartrack.report.ReportDoc.Table;
import com.scholartrack.user.Role;
import com.scholartrack.user.User;
import com.scholartrack.user.UserRepository;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Builds reports from official persisted data and the shared formulas. AI text never alters these numbers. */
@Service
public class ReportService {
    private final AnalyticsService analytics;
    private final ActivityService activity;
    private final FeeService fees;
    private final StudentRepository students;
    private final TeacherRepository teachers;
    private final TeacherAssignmentRepository assignments;
    private final UserRepository users;
    private final ClassGroupRepository classes;
    private final SubjectRepository subjects;
    private final MarkRepository marks;
    private final CourseworkRepository coursework;
    private final SubmissionRepository submissions;

    public ReportService(AnalyticsService analytics, ActivityService activity, FeeService fees, StudentRepository students,
                         TeacherRepository teachers, TeacherAssignmentRepository assignments, UserRepository users,
                         ClassGroupRepository classes, SubjectRepository subjects, MarkRepository marks,
                         CourseworkRepository coursework, SubmissionRepository submissions) {
        this.analytics = analytics; this.activity = activity; this.fees = fees; this.students = students; this.teachers = teachers;
        this.assignments = assignments; this.users = users; this.classes = classes; this.subjects = subjects; this.marks = marks;
        this.coursework = coursework; this.submissions = submissions;
    }

    // ---------------- student academic report ----------------
    @Transactional(readOnly = true)
    public ReportDoc myReport(String username) {
        User u = user(username);
        Student s = students.findByUserId(u.getId()).orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "Student profile required"));
        return studentReport(s.getId());
    }

    @Transactional(readOnly = true)
    public ReportDoc studentReport(Long studentId) {
        PerformanceDto perf = activity.performance(studentId);
        StudentRowDto row = analytics.rowFor(studentId);
        List<MarkDto> ms = activity.marksOf(studentId);
        MyFeesDto fs = fees.feesOf(studentId);

        Map<String, String> facts = new LinkedHashMap<>();
        facts.put("Name", perf.fullName());
        facts.put("Roll number", perf.rollNo());
        facts.put("Class", perf.className());
        facts.put("Semester", String.valueOf(perf.semesterNo()));
        facts.put("SGPA", f2(perf.results().sgpa()));
        facts.put("CGPA", f2(perf.results().cgpa()));
        facts.put("Overall attendance", pct(perf.attendance().percent()) + " (" + perf.attendance().attended() + "/" + perf.attendance().total() + " classes)");
        facts.put("Academic risk indicator", row.riskLevel() + " (" + row.riskScore() + "/100)");

        List<List<String>> att = new ArrayList<>();
        for (SubjectAttendanceDto a : perf.attendance().subjects())
            att.add(List.of(a.subjectCode() + " " + a.subjectName(), String.valueOf(a.attended()), String.valueOf(a.total()), pct(a.percent()), String.valueOf(a.classesNeededFor75())));
        List<List<String>> res = new ArrayList<>();
        for (SubjectResultDto r : perf.results().subjects())
            res.add(List.of(r.subjectCode() + " " + r.subjectName(), String.valueOf(r.credits()), pct(r.percentage()), String.valueOf(r.gradePoint())));
        List<List<String>> mk = new ArrayList<>();
        for (MarkDto m : ms) mk.add(List.of(m.subjectCode(), m.assessmentType().name(), m.marks().stripTrailingZeros().toPlainString(), m.maxMarks().stripTrailingZeros().toPlainString()));
        List<List<String>> prev = new ArrayList<>();
        for (PreviousSemesterDto p : perf.results().previous()) prev.add(List.of("Semester " + p.semesterNo(), f2(p.sgpa()), String.valueOf(p.credits())));
        List<List<String>> fe = new ArrayList<>();
        for (FeeDto f : fs.fees())
            fe.add(List.of(f.title(), money(f.totalAmount()), money(f.lateFeeApplied()), money(f.paid()), money(f.outstanding()), f.status(), f.dueDate().toString()));

        return new ReportDoc("Student Academic Report", perf.fullName() + " - " + perf.rollNo(), facts, List.of(
                new Table("Attendance by subject", List.of("Subject", "Attended", "Total", "Percent", "Classes needed for 75%"), att),
                new Table("Subject results (current semester)", List.of("Subject", "Credits", "Percentage", "Grade point"), res),
                new Table("Marks", List.of("Subject", "Assessment", "Marks", "Maximum"), mk),
                new Table("Previous semesters", List.of("Semester", "SGPA", "Credits"), prev),
                new Table("Fees", List.of("Fee", "Total", "Late fee", "Paid", "Outstanding", "Status", "Due date"), fe)));
    }

    // ---------------- attendance report (HOD any class; teacher only classes they teach) ----------------
    @Transactional(readOnly = true)
    public ReportDoc attendance(String username, Long classId) {
        authorize(username, classId, null);
        List<AnalyticsService.StudentStats> list = analytics.allStats().stream()
                .filter(s -> classId == null || s.classId().equals(classId)).toList();
        long attended = list.stream().mapToLong(AnalyticsService.StudentStats::attended).sum();
        long total = list.stream().mapToLong(AnalyticsService.StudentStats::total).sum();
        Map<String, String> facts = new LinkedHashMap<>();
        facts.put("Class", classId == null ? "All classes" : className(classId));
        facts.put("Students", String.valueOf(list.size()));
        facts.put("Average attendance", pct(AcademicCalc.attendancePercent((int) attended, (int) total)));
        facts.put("Below 75%", String.valueOf(list.stream().filter(s -> s.total() > 0 && s.attendancePct() < AcademicCalc.ATTENDANCE_THRESHOLD).count()));
        List<List<String>> rows = new ArrayList<>();
        for (AnalyticsService.StudentStats s : list)
            rows.add(List.of(s.rollNo(), s.name(), s.className(), String.valueOf(s.attended()), String.valueOf(s.total()), pct(s.attendancePct()),
                    s.total() > 0 && s.attendancePct() < AcademicCalc.ATTENDANCE_THRESHOLD ? "LOW" : "OK"));
        return new ReportDoc("Attendance Report", facts.get("Class"), facts,
                List.of(new Table("Student attendance", List.of("Roll no", "Name", "Class", "Attended", "Total", "Percent", "Status"), rows)));
    }

    // ---------------- marks report ----------------
    @Transactional(readOnly = true)
    public ReportDoc marksReport(String username, Long classId, Long subjectId) {
        if (classId == null || subjectId == null) throw bad("classId and subjectId are required");
        authorize(username, classId, subjectId);
        Subject subject = subjects.findById(subjectId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Subject not found"));
        List<Mark> list = marks.findBySubjectIdAndStudentClassGroupIdOrderByStudentRollNo(subjectId, classId);
        List<List<String>> rows = new ArrayList<>();
        double obt = 0, max = 0;
        for (Mark m : list) {
            obt += m.getMarks().doubleValue(); max += m.getMaxMarks().doubleValue();
            rows.add(List.of(m.getStudent().getRollNo(), m.getStudent().getUser().getFullName(), m.getAssessmentType().name(),
                    m.getMarks().stripTrailingZeros().toPlainString(), m.getMaxMarks().stripTrailingZeros().toPlainString(),
                    pct(AcademicCalc.percentage(m.getMarks().doubleValue(), m.getMaxMarks().doubleValue()))));
        }
        Map<String, String> facts = new LinkedHashMap<>();
        facts.put("Class", className(classId));
        facts.put("Subject", subject.getCode() + " " + subject.getName());
        facts.put("Records", String.valueOf(list.size()));
        facts.put("Overall average", pct(AcademicCalc.percentage(obt, max)));
        return new ReportDoc("Marks Report", facts.get("Class") + " - " + subject.getCode(), facts,
                List.of(new Table("Marks", List.of("Roll no", "Name", "Assessment", "Marks", "Maximum", "Percent"), rows)));
    }

    // ---------------- assignment report ----------------
    @Transactional(readOnly = true)
    public ReportDoc assignmentReport(String username, Long classId) {
        if (classId == null) throw bad("classId is required");
        User u = authorize(username, classId, null);
        Long teacherId = u.getRole() == Role.TEACHER ? teachers.findByUserId(u.getId()).map(Teacher::getId).orElse(null) : null;
        int classSize = students.findByClassGroupIdOrderByRollNo(classId).size();
        List<List<String>> rows = new ArrayList<>();
        for (Coursework cw : coursework.findByClassGroupIdOrderByDeadlineAsc(classId)) {
            if (teacherId != null && !cw.getTeacher().getId().equals(teacherId)) continue;
            List<Submission> subs = submissions.findByCourseworkId(cw.getId());
            long late = subs.stream().filter(s -> s.getSubmittedAt().isAfter(cw.getDeadline())).count();
            List<Submission> evaluated = subs.stream().filter(s -> s.getStatus() == SubmissionStatus.EVALUATED && s.getMarks() != null).toList();
            double avg = evaluated.stream().mapToDouble(s -> s.getMarks().doubleValue()).average().orElse(0);
            rows.add(List.of(cw.getTitle(), cw.getSubject().getCode(), cw.getDeadline().toLocalDate().toString(),
                    cw.getMaxMarks().stripTrailingZeros().toPlainString(), String.valueOf(subs.size()), String.valueOf(late),
                    String.valueOf(evaluated.size()), String.valueOf(Math.max(0, classSize - subs.size())), evaluated.isEmpty() ? "-" : f2(avg)));
        }
        Map<String, String> facts = new LinkedHashMap<>();
        facts.put("Class", className(classId));
        facts.put("Students in class", String.valueOf(classSize));
        facts.put("Assignments", String.valueOf(rows.size()));
        return new ReportDoc("Assignment Report", facts.get("Class"), facts, List.of(new Table("Assignments",
                List.of("Assignment", "Subject", "Deadline", "Max marks", "Submitted", "Late", "Evaluated", "Not submitted", "Average marks"), rows)));
    }

    // ---------------- fee report (HOD) ----------------
    @Transactional(readOnly = true)
    public ReportDoc feeReport() {
        FeeSummaryDto sm = fees.summaryForHod();
        Map<String, String> facts = new LinkedHashMap<>();
        facts.put("Total billed", money(sm.totalBilled()));
        facts.put("Collected", money(sm.totalCollected()));
        facts.put("Outstanding", money(sm.totalOutstanding()));
        facts.put("Fees fully paid", sm.fullyPaidCount() + " of " + sm.feeCount());
        facts.put("Overdue", String.valueOf(sm.overdueCount()));
        List<List<String>> rows = new ArrayList<>();
        for (FeeDto f : fees.allFees())
            rows.add(List.of(f.rollNo(), f.studentName(), f.title(), money(f.totalAmount()), money(f.lateFeeApplied()), money(f.paid()),
                    money(f.outstanding()), f.status(), f.dueDate().toString()));
        return new ReportDoc("Fee Report", "Department fee status", facts, List.of(new Table("Fees",
                List.of("Roll no", "Name", "Fee", "Total", "Late fee", "Paid", "Outstanding", "Status", "Due date"), rows)));
    }

    // ---------------- department performance report (HOD) ----------------
    @Transactional(readOnly = true)
    public ReportDoc departmentReport() {
        DashboardDto d = analytics.dashboard();
        Map<String, String> facts = new LinkedHashMap<>();
        facts.put("Students", String.valueOf(d.totalStudents()));
        facts.put("Teachers", String.valueOf(d.totalTeachers()));
        facts.put("Average CGPA", f2(d.averageCgpa()));
        facts.put("Average attendance", pct(d.averageAttendance()));
        facts.put("Students below 75% attendance", String.valueOf(d.lowAttendanceCount()));
        facts.put("High-risk students", String.valueOf(d.highRiskCount()));
        facts.put("Medium-risk students", String.valueOf(d.mediumRiskCount()));
        facts.put("Assignment completion", pct(d.assignmentCompletionPct()));
        facts.put("Outstanding fees", money(d.outstandingFees()));

        List<List<String>> sem = new ArrayList<>();
        for (SemesterStatDto s : analytics.semesters())
            sem.add(List.of("Semester " + s.semesterNo(), String.valueOf(s.students()), pct(s.averageAttendance()), f2(s.averageSgpa()),
                    f2(s.averageCgpa()), String.valueOf(s.lowAttendanceCount()), String.valueOf(s.highRiskCount())));
        List<List<String>> subj = new ArrayList<>();
        for (SubjectStatDto s : analytics.subjects())
            subj.add(List.of(s.code(), s.name(), String.valueOf(s.semesterNo()), pct(s.averagePercentage()), pct(s.averageAttendance()),
                    String.valueOf(s.studentsAssessed()), String.valueOf(s.failingCount())));
        List<List<String>> stu = new ArrayList<>();
        analytics.allStats().stream()
                .sorted(Comparator.comparingInt((AnalyticsService.StudentStats s) -> s.risk().score()).reversed().thenComparing(AnalyticsService.StudentStats::rollNo))
                .forEach(s -> stu.add(List.of(s.rollNo(), s.name(), s.className(), pct(s.attendancePct()), pct(s.marksPct()), f2(s.sgpa()),
                        f2(s.cgpa()), String.valueOf(s.risk().score()), s.risk().level())));
        return new ReportDoc("Department Performance Report", "Computer Science & Engineering", facts, List.of(
                new Table("Semester summary", List.of("Semester", "Students", "Avg attendance", "Avg SGPA", "Avg CGPA", "Below 75%", "High risk"), sem),
                new Table("Subject performance (weakest first)", List.of("Code", "Subject", "Semester", "Avg percentage", "Avg attendance", "Assessed", "Failing"), subj),
                new Table("Student performance (highest risk first)", List.of("Roll no", "Name", "Class", "Attendance", "Marks", "SGPA", "CGPA", "Risk score", "Risk level"), stu)));
    }

    // ---------------- helpers ----------------
    /** HOD: any class. Teacher: classId required and must be a class (and subject, if given) they teach. */
    private User authorize(String username, Long classId, Long subjectId) {
        User u = user(username);
        if (u.getRole() == Role.HOD) return u;
        if (u.getRole() != Role.TEACHER) throw new ApiException(HttpStatus.FORBIDDEN, "You do not have permission to access this report");
        if (classId == null) throw bad("classId is required");
        Teacher t = teachers.findByUserId(u.getId()).orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "You are not assigned to this class"));
        boolean ok = assignments.findByTeacherId(t.getId()).stream().anyMatch(ta ->
                ta.getClassGroup().getId().equals(classId) && (subjectId == null || ta.getSubject().getId().equals(subjectId)));
        if (!ok) throw new ApiException(HttpStatus.FORBIDDEN, "You are not assigned to this class or subject");
        return u;
    }

    private String className(Long classId) {
        return classes.findById(classId).map(ClassGroup::getName).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Class not found"));
    }
    private User user(String username) {
        return users.findByUsernameIgnoreCase(username).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required"));
    }
    private static ApiException bad(String m) { return new ApiException(HttpStatus.BAD_REQUEST, m); }
    private static String f2(double v) { return String.format(Locale.ROOT, "%.2f", v); }
    private static String pct(double v) { return String.format(Locale.ROOT, "%.1f%%", v); }
    private static String money(java.math.BigDecimal v) { return "Rs. " + v.setScale(2, java.math.RoundingMode.HALF_UP).toPlainString(); }
}
