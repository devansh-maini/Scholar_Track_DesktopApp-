package com.scholartrack.ai;

import com.scholartrack.academic.AcademicDtos.AssignmentDto;
import com.scholartrack.academic.AcademicService;
import com.scholartrack.academic.Student;
import com.scholartrack.academic.StudentRepository;
import com.scholartrack.activity.ActivityDtos.*;
import com.scholartrack.activity.ActivityService;
import com.scholartrack.analytics.AnalyticsDtos.*;
import com.scholartrack.analytics.AnalyticsService;
import com.scholartrack.common.ApiException;
import com.scholartrack.fee.FeeDtos.*;
import com.scholartrack.fee.FeeService;
import com.scholartrack.syllabus.SyllabusDtos.OverviewRowDto;
import com.scholartrack.syllabus.SyllabusService;
import com.scholartrack.user.User;
import com.scholartrack.user.UserRepository;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/**
 * Builds the ONLY data the AI is allowed to see, based on the caller's role. The backend (never the model) decides
 * what is included, using the same services and formulas as the screens, so AI answers match the official numbers.
 */
@Component
public class AiContextBuilder {
    private final UserRepository users;
    private final StudentRepository students;
    private final AnalyticsService analytics;
    private final ActivityService activity;
    private final FeeService fees;
    private final AcademicService academic;
    private final SyllabusService syllabus;

    public AiContextBuilder(UserRepository users, StudentRepository students, AnalyticsService analytics, ActivityService activity,
                            FeeService fees, AcademicService academic, SyllabusService syllabus) {
        this.users = users; this.students = students; this.analytics = analytics; this.activity = activity;
        this.fees = fees; this.academic = academic; this.syllabus = syllabus;
    }

    public String build(String username) {
        User u = users.findByUsernameIgnoreCase(username).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required"));
        return switch (u.getRole()) {
            case STUDENT -> student(username, u);
            case TEACHER -> teacher(username, u);
            case HOD -> hod();
        };
    }

    // ---------------------------------------------------------------- student
    private String student(String username, User u) {
        Student s = students.findByUserId(u.getId()).orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "Student profile required"));
        RiskDetailDto rd = analytics.riskDetail(s.getId());
        StudentRowDto row = rd.student();
        PerformanceDto perf = activity.performance(s.getId());
        List<MarkDto> ms = activity.marksOf(s.getId());
        List<MyCourseworkDto> cw = activity.myCoursework(username);
        MyFeesDto fs = fees.feesOf(s.getId());

        StringBuilder b = new StringBuilder();
        b.append("ROLE: STUDENT. This person may only discuss their own academic data.\n");
        b.append(String.format(Locale.ROOT, "Student: %s | Roll %s | Class %s | Semester %d\n", row.name(), row.rollNo(), row.className(), row.semesterNo()));
        b.append(String.format(Locale.ROOT, "OFFICIAL RESULTS: SGPA %.2f | CGPA %.2f | overall attendance %.1f%% (%d of %d classes attended; minimum required 75%%)\n",
                row.sgpa(), row.cgpa(), row.attendancePct(), row.attended(), row.total()));
        b.append("RISK INDICATOR (rule-based, not machine learning): ").append(rd.risk().score()).append("/100 ").append(rd.risk().level());
        if (!rd.risk().reasons().isEmpty()) b.append(". Reasons: ").append(String.join("; ", rd.risk().reasons()));
        b.append("\nATTENDANCE BY SUBJECT:\n");
        for (SubjectAttendanceDto a : perf.attendance().subjects())
            b.append(String.format(Locale.ROOT, "- %s %s: %d/%d = %.1f%%; more classes needed to reach 75%%: %d\n", a.subjectCode(), a.subjectName(),
                    a.attended(), a.total(), a.percent(), a.classesNeededFor75()));
        b.append("SUBJECT RESULTS THIS SEMESTER:\n");
        for (SubjectResultDto r : perf.results().subjects())
            b.append(String.format(Locale.ROOT, "- %s %s: %.1f%% -> grade point %d (%d credits)\n", r.subjectCode(), r.subjectName(), r.percentage(), r.gradePoint(), r.credits()));
        b.append("MARKS:\n");
        for (MarkDto m : ms)
            b.append("- ").append(m.subjectCode()).append(' ').append(m.assessmentType()).append(": ")
                    .append(m.marks().stripTrailingZeros().toPlainString()).append('/').append(m.maxMarks().stripTrailingZeros().toPlainString()).append('\n');
        if (!perf.results().previous().isEmpty()) {
            b.append("PREVIOUS SEMESTERS: ");
            b.append(perf.results().previous().stream().map(p -> String.format(Locale.ROOT, "Sem %d SGPA %.2f", p.semesterNo(), p.sgpa())).collect(Collectors.joining("; ")));
            b.append('\n');
        }
        b.append("ASSIGNMENTS:\n");
        for (MyCourseworkDto c : cw)
            b.append("- ").append(c.subjectCode()).append(" '").append(c.title()).append("': due ").append(c.deadline().toLocalDate())
                    .append(", status ").append(c.status()).append(c.marks() == null ? "" : ", marks " + c.marks().stripTrailingZeros().toPlainString() + "/" + c.maxMarks().stripTrailingZeros().toPlainString()).append('\n');
        b.append("FEES: total outstanding Rs. ").append(fs.totalOutstanding().toPlainString()).append('\n');
        for (FeeDto f : fs.fees())
            b.append("- ").append(f.title()).append(": ").append(f.status()).append(", outstanding Rs. ").append(f.outstanding().toPlainString()).append(", due ").append(f.dueDate()).append('\n');
        return b.toString();
    }

    // ---------------------------------------------------------------- teacher
    private String teacher(String username, User u) {
        List<AssignmentDto> mine = academic.teacherAssignments(username);
        Map<Long, List<AssignmentDto>> byClass = mine.stream().collect(Collectors.groupingBy(AssignmentDto::classId, LinkedHashMap::new, Collectors.toList()));
        List<AnalyticsService.StudentStats> all = analytics.allStats();
        Set<String> mySubjectClass = mine.stream().map(a -> a.classId() + ":" + a.subjectId()).collect(Collectors.toSet());
        List<OverviewRowDto> syl = syllabus.overview().stream().filter(r -> mySubjectClass.contains(r.classId() + ":" + r.subjectId())).toList();

        StringBuilder b = new StringBuilder();
        b.append("ROLE: TEACHER. This person may only discuss the classes and subjects they teach.\n");
        b.append("Teacher: ").append(u.getFullName()).append('\n');
        for (Map.Entry<Long, List<AssignmentDto>> e : byClass.entrySet()) {
            List<AnalyticsService.StudentStats> cls = all.stream().filter(s -> s.classId().equals(e.getKey())).toList();
            String className = e.getValue().get(0).className();
            long att = cls.stream().mapToLong(AnalyticsService.StudentStats::attended).sum(), tot = cls.stream().mapToLong(AnalyticsService.StudentStats::total).sum();
            double marksAvg = cls.stream().filter(s -> s.marksPct() > 0).mapToDouble(AnalyticsService.StudentStats::marksPct).average().orElse(0);
            b.append(String.format(Locale.ROOT, "\nCLASS %s: %d students; average attendance %.1f%%; average marks %.1f%%; subjects you teach here: %s\n",
                    className, cls.size(), tot == 0 ? 0.0 : att * 100.0 / tot, marksAvg,
                    e.getValue().stream().map(AssignmentDto::subjectCode).distinct().collect(Collectors.joining(", "))));
            b.append("Students needing attention (attendance below 75%, marks below 50%, or HIGH risk):\n");
            int shown = 0;
            for (AnalyticsService.StudentStats s : cls) {
                boolean lowAtt = s.total() > 0 && s.attendancePct() < 75, lowMarks = s.marksPct() > 0 && s.marksPct() < 50, high = s.risk().level().equals("HIGH");
                if ((lowAtt || lowMarks || high) && shown++ < 15)
                    b.append(String.format(Locale.ROOT, "- %s (%s): attendance %.1f%%, marks %.1f%%, risk %s (%d)%s\n", s.name(), s.rollNo(), s.attendancePct(),
                            s.marksPct(), s.risk().level(), s.risk().score(), lowAtt && lowMarks ? " [LOW ATTENDANCE AND LOW MARKS]" : ""));
            }
            if (shown == 0) b.append("- none\n");
        }
        b.append("\nSYLLABUS PROGRESS OF YOUR SUBJECTS:\n");
        for (OverviewRowDto r : syl)
            b.append(String.format(Locale.ROOT, "- %s %s: %.1f%% (%d of %d topics)\n", r.className(), r.subjectCode(), r.percentComplete(), r.topicsDone(), r.topicsTotal()));
        return b.toString();
    }

    // ---------------------------------------------------------------- HOD
    private String hod() {
        DashboardDto d = analytics.dashboard();
        List<SemesterStatDto> sems = analytics.semesters();
        List<SubjectStatDto> subs = analytics.subjects();
        List<StudentRowDto> low = analytics.lowAttendance();
        List<StudentRowDto> high = analytics.riskPage("HIGH", 0, 10).content();
        List<OverviewRowDto> sylLow = syllabus.overview().stream().filter(r -> r.percentComplete() < 50).toList();

        StringBuilder b = new StringBuilder();
        b.append("ROLE: HOD. Department-wide access.\n");
        b.append(String.format(Locale.ROOT, "DASHBOARD: %d students, %d teachers; average CGPA %.2f; average attendance %.1f%%; %d students below 75%% attendance; %d HIGH-risk and %d MEDIUM-risk students; assignment completion %.1f%%; outstanding fees Rs. %s (%d fees overdue); %d open complaints\n",
                d.totalStudents(), d.totalTeachers(), d.averageCgpa(), d.averageAttendance(), d.lowAttendanceCount(), d.highRiskCount(), d.mediumRiskCount(),
                d.assignmentCompletionPct(), d.outstandingFees().toPlainString(), d.overdueFeeCount(), d.openComplaints()));
        sems.stream().min(Comparator.comparingDouble(SemesterStatDto::averageAttendance)).ifPresent(s ->
                b.append(String.format(Locale.ROOT, "LOWEST-ATTENDANCE SEMESTER: Semester %d (%.1f%%)\n", s.semesterNo(), s.averageAttendance())));
        b.append("SEMESTERS:\n");
        for (SemesterStatDto s : sems)
            b.append(String.format(Locale.ROOT, "- Semester %d: %d students, attendance %.1f%%, avg SGPA %.2f, avg CGPA %.2f, below 75%%: %d, HIGH risk: %d\n",
                    s.semesterNo(), s.students(), s.averageAttendance(), s.averageSgpa(), s.averageCgpa(), s.lowAttendanceCount(), s.highRiskCount()));
        b.append("SUBJECTS (weakest first):\n");
        for (SubjectStatDto s : subs)
            b.append(String.format(Locale.ROOT, "- %s %s (semester %d): average %.1f%%, attendance %.1f%%, %d students failing (<40%%) of %d\n",
                    s.code(), s.name(), s.semesterNo(), s.averagePercentage(), s.averageAttendance(), s.failingCount(), s.studentsAssessed()));
        b.append("STUDENTS BELOW 75% ATTENDANCE (").append(low.size()).append("):\n");
        low.stream().limit(15).forEach(s -> b.append(String.format(Locale.ROOT, "- %s (%s, %s): %.1f%%\n", s.name(), s.rollNo(), s.className(), s.attendancePct())));
        b.append("HIGH-RISK STUDENTS (top ").append(high.size()).append(" by score; intervention candidates):\n");
        for (StudentRowDto s : high)
            b.append(String.format(Locale.ROOT, "- %s (%s, %s): risk %d, attendance %.1f%%, marks %.1f%%, CGPA %.2f\n", s.name(), s.rollNo(), s.className(),
                    s.riskScore(), s.attendancePct(), s.marksPct(), s.cgpa()));
        b.append("SYLLABUS BEHIND SCHEDULE (<50% complete):\n");
        if (sylLow.isEmpty()) b.append("- none\n");
        for (OverviewRowDto r : sylLow)
            b.append(String.format(Locale.ROOT, "- %s %s taught by %s: %.1f%%\n", r.className(), r.subjectCode(), r.teacherName(), r.percentComplete()));
        return b.toString();
    }
}
