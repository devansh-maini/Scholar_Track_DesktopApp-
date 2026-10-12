package com.scholartrack.analytics;

import com.scholartrack.academic.*;
import com.scholartrack.academic.AcademicDtos.PageDto;
import com.scholartrack.activity.*;
import com.scholartrack.analytics.AnalyticsDtos.*;
import com.scholartrack.common.ApiException;
import com.scholartrack.complaint.Complaint;
import com.scholartrack.complaint.ComplaintRepository;
import com.scholartrack.fee.FeeDtos.FeeSummaryDto;
import com.scholartrack.fee.FeeService;
import com.scholartrack.notice.Notice;
import com.scholartrack.notice.NoticeRepository;
import com.scholartrack.user.Role;
import com.scholartrack.user.User;
import com.scholartrack.user.UserRepository;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Department analytics. Reads the same persisted records and uses the same AcademicCalc / RiskCalc formulas as the
 * student and teacher screens, so a number never differs between roles. Uses aggregation queries (no per-row loading).
 */
@Service
public class AnalyticsService {

    /** Everything computed for one student (also consumed by reports and the AI context builder). */
    public record StudentStats(Long id, String rollNo, String name, Long classId, String className, int semesterNo,
                               int attended, int total, double attendancePct, double marksPct, double sgpa, double cgpa,
                               Double previousCgpa, Double trend, int submitted, int assignmentsTotal, double assignmentPct,
                               RiskCalc.Result risk) {}

    private record Data(List<StudentStats> stats, Map<Long, Map<Long, double[]>> marksBy, Map<Long, Subject> subjects) {}

    private final StudentRepository students;
    private final TeacherRepository teachers;
    private final SubjectRepository subjects;
    private final TeacherAssignmentRepository assignments;
    private final AttendanceRepository attendance;
    private final MarkRepository marks;
    private final SubmissionRepository submissions;
    private final CourseworkRepository coursework;
    private final SemesterResultRepository semesterResults;
    private final FeeService fees;
    private final NoticeRepository notices;
    private final ComplaintRepository complaints;
    private final UserRepository users;

    public AnalyticsService(StudentRepository students, TeacherRepository teachers, SubjectRepository subjects,
                            TeacherAssignmentRepository assignments, AttendanceRepository attendance, MarkRepository marks,
                            SubmissionRepository submissions, CourseworkRepository coursework, SemesterResultRepository semesterResults,
                            FeeService fees, NoticeRepository notices, ComplaintRepository complaints, UserRepository users) {
        this.students = students; this.teachers = teachers; this.subjects = subjects; this.assignments = assignments;
        this.attendance = attendance; this.marks = marks; this.submissions = submissions; this.coursework = coursework;
        this.semesterResults = semesterResults; this.fees = fees; this.notices = notices; this.complaints = complaints;
        this.users = users;
    }

    // ============================== public API ==============================
    @Transactional(readOnly = true)
    public List<StudentStats> allStats() { return loadData().stats(); }

    @Transactional(readOnly = true)
    public StudentRowDto rowFor(Long studentId) { return toRow(statsFor(studentId)); }

    @Transactional(readOnly = true)
    public RiskDetailDto riskDetail(Long studentId) {
        StudentStats s = statsFor(studentId);
        return new RiskDetailDto(toRow(s), toDto(s.risk()), s.previousCgpa(), s.trend());
    }

    @Transactional(readOnly = true)
    public RiskDetailDto myRisk(String username) {
        User u = users.findByUsernameIgnoreCase(username).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required"));
        Student s = students.findByUserId(u.getId()).orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "Student profile required"));
        return riskDetail(s.getId());
    }

    @Transactional(readOnly = true)
    public DashboardDto dashboard() {
        List<StudentStats> st = allStats();
        FeeSummaryDto fs = fees.summaryForHod();
        long attended = st.stream().mapToLong(StudentStats::attended).sum();
        long total = st.stream().mapToLong(StudentStats::total).sum();
        long submitted = st.stream().mapToLong(StudentStats::submitted).sum();
        long assignTotal = st.stream().mapToLong(StudentStats::assignmentsTotal).sum();
        List<ActivityItemDto> recent = new ArrayList<>();
        for (Notice n : notices.findAllByOrderByCreatedAtDesc().stream().limit(5).toList())
            recent.add(new ActivityItemDto("NOTICE", "Notice published: " + n.getTitle(), n.getCreatedAt()));
        List<Complaint> allComplaints = complaints.findAllByOrderByCreatedAtDesc();
        for (Complaint c : allComplaints.stream().limit(5).toList())
            recent.add(new ActivityItemDto("COMPLAINT", "Complaint (" + c.getStatus() + "): " + c.getTitle(), c.getCreatedAt()));
        recent.sort(Comparator.comparing(ActivityItemDto::at).reversed());
        return new DashboardDto(st.size(), (int) teachers.count(), avgCgpa(st), AcademicCalc.attendancePercent((int) attended, (int) total),
                (int) st.stream().filter(this::lowAttendance).count(),
                (int) st.stream().filter(s -> s.risk().level().equals("HIGH")).count(),
                (int) st.stream().filter(s -> s.risk().level().equals("MEDIUM")).count(),
                assignTotal == 0 ? 100.0 : AcademicCalc.percentage(submitted, assignTotal),
                fs.totalOutstanding(), fs.overdueCount(), allComplaints.stream().filter(c -> !c.isClosed()).count(),
                recent.stream().limit(8).toList());
    }

    @Transactional(readOnly = true)
    public List<SemesterStatDto> semesters() {
        Map<Integer, List<StudentStats>> by = allStats().stream().collect(Collectors.groupingBy(StudentStats::semesterNo, TreeMap::new, Collectors.toList()));
        List<SemesterStatDto> out = new ArrayList<>();
        by.forEach((sem, list) -> out.add(new SemesterStatDto(sem, list.size(), weightedAttendance(list), avgSgpa(list), avgCgpa(list),
                (int) list.stream().filter(this::lowAttendance).count(), (int) list.stream().filter(s -> s.risk().level().equals("HIGH")).count())));
        return out;
    }

    @Transactional(readOnly = true)
    public List<ClassStatDto> classes() {
        Map<Long, List<StudentStats>> by = allStats().stream().collect(Collectors.groupingBy(StudentStats::classId, LinkedHashMap::new, Collectors.toList()));
        List<ClassStatDto> out = new ArrayList<>();
        by.forEach((cid, list) -> {
            StudentStats f = list.get(0);
            long sub = list.stream().mapToLong(StudentStats::submitted).sum();
            long tot = list.stream().mapToLong(StudentStats::assignmentsTotal).sum();
            double marksAvg = list.stream().filter(s -> s.marksPct() > 0).mapToDouble(StudentStats::marksPct).average().orElse(0);
            out.add(new ClassStatDto(cid, f.className(), f.semesterNo(), list.size(), weightedAttendance(list),
                    AcademicCalc.round2(marksAvg), avgSgpa(list), tot == 0 ? 100.0 : AcademicCalc.percentage(sub, tot)));
        });
        out.sort(Comparator.comparing(ClassStatDto::className));
        return out;
    }

    /** Weakest subjects first. */
    @Transactional(readOnly = true)
    public List<SubjectStatDto> subjects() {
        Data d = loadData();
        Map<Long, double[]> agg = new HashMap<>();   // subjectId -> [obtained, max, students, failing]
        for (Map<Long, double[]> perSubject : d.marksBy().values())
            perSubject.forEach((sid, v) -> {
                double[] a = agg.computeIfAbsent(sid, k -> new double[4]);
                a[0] += v[0]; a[1] += v[1]; a[2] += 1;
                if (AcademicCalc.percentage(v[0], v[1]) < 40) a[3] += 1;
            });
        Map<Long, long[]> att = new HashMap<>();
        for (Object[] r : attendance.totalsBySubject()) att.put((Long) r[0], new long[]{((Number) r[2]).longValue(), ((Number) r[1]).longValue()});
        List<SubjectStatDto> out = new ArrayList<>();
        agg.forEach((sid, a) -> {
            Subject s = d.subjects().get(sid);
            if (s == null) return;
            long[] at = att.getOrDefault(sid, new long[]{0, 0});
            out.add(new SubjectStatDto(sid, s.getCode(), s.getName(), s.getSemesterNo(), s.getCredits(), AcademicCalc.percentage(a[0], a[1]),
                    AcademicCalc.attendancePercent((int) at[0], (int) at[1]), (int) a[2], (int) a[3]));
        });
        out.sort(Comparator.comparingDouble(SubjectStatDto::averagePercentage));
        return out;
    }

    @Transactional(readOnly = true)
    public List<AttendancePointDto> attendanceTrend() {
        List<AttendancePointDto> out = new ArrayList<>();
        for (Object[] r : attendance.dailyTotals()) {
            int total = ((Number) r[1]).intValue(), present = ((Number) r[2]).intValue();
            out.add(new AttendancePointDto((LocalDate) r[0], present, total, AcademicCalc.attendancePercent(present, total)));
        }
        return out;
    }

    @Transactional(readOnly = true)
    public PageDto<StudentRowDto> riskPage(String level, int page, int size) {
        String lv = level == null ? "" : level.trim().toUpperCase(Locale.ROOT);
        if (!lv.isEmpty() && !List.of("LOW", "MEDIUM", "HIGH").contains(lv)) throw new ApiException(HttpStatus.BAD_REQUEST, "level must be LOW, MEDIUM or HIGH");
        List<StudentRowDto> rows = allStats().stream()
                .filter(s -> lv.isEmpty() || s.risk().level().equals(lv))
                .sorted(Comparator.comparingInt((StudentStats s) -> s.risk().score()).reversed().thenComparing(StudentStats::rollNo))
                .map(s -> toRow(s)).toList();
        int safeSize = Math.max(1, Math.min(size, 100)), safePage = Math.max(page, 0);
        int from = Math.min(safePage * safeSize, rows.size()), to = Math.min(from + safeSize, rows.size());
        return new PageDto<>(rows.subList(from, to), safePage, safeSize, rows.size(), (int) Math.ceil(rows.size() / (double) safeSize));
    }

    @Transactional(readOnly = true)
    public List<StudentRowDto> compare(List<Long> ids) {
        if (ids == null || ids.size() < 2 || ids.size() > 5) throw new ApiException(HttpStatus.BAD_REQUEST, "Choose between 2 and 5 students to compare");
        Map<Long, StudentStats> byId = allStats().stream().collect(Collectors.toMap(StudentStats::id, s -> s));
        List<StudentRowDto> out = new ArrayList<>();
        for (Long id : new LinkedHashSet<>(ids)) {
            StudentStats s = byId.get(id);
            if (s == null) throw new ApiException(HttpStatus.NOT_FOUND, "Student " + id + " not found");
            out.add(toRow(s));
        }
        return out;
    }

    @Transactional(readOnly = true)
    public List<StudentRowDto> lowAttendance() {
        return allStats().stream().filter(this::lowAttendance).sorted(Comparator.comparingDouble(StudentStats::attendancePct))
                .map(s -> toRow(s)).toList();
    }

    /** Teacher: only classes they teach. HOD: any class. */
    @Transactional(readOnly = true)
    public List<StudentRowDto> classPerformance(String username, Long classId) {
        User u = users.findByUsernameIgnoreCase(username).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required"));
        if (u.getRole() == Role.TEACHER) {
            Teacher t = teachers.findByUserId(u.getId()).orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "You are not assigned to this class"));
            boolean ok = assignments.findByTeacherId(t.getId()).stream().anyMatch(ta -> ta.getClassGroup().getId().equals(classId));
            if (!ok) throw new ApiException(HttpStatus.FORBIDDEN, "You are not assigned to this class");
        }
        return allStats().stream().filter(s -> s.classId().equals(classId)).map(s -> toRow(s)).toList();
    }

    // ============================== internals ==============================
    private StudentStats statsFor(Long id) {
        return allStats().stream().filter(s -> s.id().equals(id)).findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Student not found"));
    }

    private boolean lowAttendance(StudentStats s) { return s.total() > 0 && s.attendancePct() < AcademicCalc.ATTENDANCE_THRESHOLD; }

    private static double weightedAttendance(List<StudentStats> list) {
        long a = list.stream().mapToLong(StudentStats::attended).sum(), t = list.stream().mapToLong(StudentStats::total).sum();
        return AcademicCalc.attendancePercent((int) a, (int) t);
    }
    private static double avgSgpa(List<StudentStats> list) {
        return AcademicCalc.round2(list.stream().filter(s -> s.sgpa() > 0).mapToDouble(StudentStats::sgpa).average().orElse(0));
    }
    private static double avgCgpa(List<StudentStats> list) {
        return AcademicCalc.round2(list.stream().filter(s -> s.cgpa() > 0).mapToDouble(StudentStats::cgpa).average().orElse(0));
    }

    private Data loadData() {
        List<Student> all = students.findAllByOrderByRollNo();
        Map<Long, long[]> att = new HashMap<>();   // studentId -> [attended, total]
        for (Object[] r : attendance.totalsByStudent()) att.put((Long) r[0], new long[]{((Number) r[2]).longValue(), ((Number) r[1]).longValue()});
        Map<Long, Map<Long, double[]>> marksBy = new HashMap<>();   // studentId -> subjectId -> [obtained, max]
        for (Object[] r : marks.totalsByStudentSubject())
            marksBy.computeIfAbsent((Long) r[0], k -> new HashMap<>()).put((Long) r[1], new double[]{((Number) r[2]).doubleValue(), ((Number) r[3]).doubleValue()});
        Map<Long, Integer> submitted = new HashMap<>();
        for (Object[] r : submissions.countByStudent()) submitted.put((Long) r[0], ((Number) r[1]).intValue());
        Map<Long, Integer> cwByClass = new HashMap<>();
        for (Object[] r : coursework.countByClass()) cwByClass.put((Long) r[0], ((Number) r[1]).intValue());
        Map<Long, Subject> subjectMap = subjects.findAll().stream().collect(Collectors.toMap(Subject::getId, s -> s));
        Map<Long, List<SemesterResult>> prevBy = semesterResults.findAll().stream().collect(Collectors.groupingBy(p -> p.getStudent().getId()));

        List<StudentStats> out = new ArrayList<>();
        for (Student s : all)
            out.add(compute(s, att.get(s.getId()), marksBy.get(s.getId()), submitted.getOrDefault(s.getId(), 0),
                    cwByClass.getOrDefault(s.getClassGroup().getId(), 0), prevBy.get(s.getId()), subjectMap));
        return new Data(out, marksBy, subjectMap);
    }

    private StudentStats compute(Student s, long[] att, Map<Long, double[]> marksMap, int submitted, int cwTotal,
                                 List<SemesterResult> prevAll, Map<Long, Subject> subjectMap) {
        int attended = att == null ? 0 : (int) att[0];
        int total = att == null ? 0 : (int) att[1];
        double attPct = AcademicCalc.attendancePercent(attended, total);

        double obtained = 0, max = 0;
        List<AcademicCalc.CreditGrade> grades = new ArrayList<>();
        if (marksMap != null)
            for (Map.Entry<Long, double[]> e : marksMap.entrySet()) {
                Subject sub = subjectMap.get(e.getKey());
                if (sub == null) continue;
                double[] v = e.getValue();
                obtained += v[0]; max += v[1];
                grades.add(new AcademicCalc.CreditGrade(sub.getCredits(), AcademicCalc.gradePoint(AcademicCalc.percentage(v[0], v[1]))));
            }
        double marksPct = AcademicCalc.percentage(obtained, max);
        double sgpa = AcademicCalc.sgpa(grades);
        int currentCredits = grades.stream().mapToInt(AcademicCalc.CreditGrade::credits).sum();

        int semNo = s.getClassGroup().getSemesterNo();
        List<SemesterResult> prev = prevAll == null ? List.of() : prevAll.stream().filter(p -> p.getSemesterNo() < semNo)
                .sorted(Comparator.comparingInt(SemesterResult::getSemesterNo)).toList();
        List<AcademicCalc.SemesterScore> prevScores = new ArrayList<>();
        for (SemesterResult p : prev) prevScores.add(new AcademicCalc.SemesterScore(p.getSgpa().doubleValue(), p.getCredits()));
        List<AcademicCalc.SemesterScore> allScores = new ArrayList<>(prevScores);
        if (currentCredits > 0) allScores.add(new AcademicCalc.SemesterScore(sgpa, currentCredits));
        double cgpa = AcademicCalc.cgpa(allScores);

        Double previousCgpa = null;
        if (!prev.isEmpty()) previousCgpa = AcademicCalc.cgpa(prevScores);
        else if (currentCredits > 0) previousCgpa = sgpa;
        Double trend = null;
        if (!prev.isEmpty() && currentCredits > 0) trend = AcademicCalc.round2(sgpa - prev.get(prev.size() - 1).getSgpa().doubleValue());

        double assignPct = cwTotal == 0 ? 100.0 : AcademicCalc.percentage(Math.min(submitted, cwTotal), cwTotal);
        RiskCalc.Result risk = RiskCalc.compute(new RiskCalc.Inputs(
                total > 0 ? Double.valueOf(attPct) : null, max > 0 ? Double.valueOf(marksPct) : null,
                cwTotal > 0 ? Double.valueOf(assignPct) : null, previousCgpa, trend));
        return new StudentStats(s.getId(), s.getRollNo(), s.getUser().getFullName(), s.getClassGroup().getId(), s.getClassGroup().getName(),
                semNo, attended, total, attPct, marksPct, sgpa, cgpa, previousCgpa, trend, submitted, cwTotal, assignPct, risk);
    }

    private static StudentRowDto toRow(StudentStats s) {
        return new StudentRowDto(s.id(), s.rollNo(), s.name(), s.className(), s.semesterNo(), s.attended(), s.total(), s.attendancePct(),
                s.total() > 0 && s.attendancePct() < AcademicCalc.ATTENDANCE_THRESHOLD, s.marksPct(), s.sgpa(), s.cgpa(),
                s.assignmentPct(), s.risk().score(), s.risk().level());
    }

    private static RiskDto toDto(RiskCalc.Result r) {
        return new RiskDto(r.score(), r.level(), r.components().stream()
                .map(c -> new RiskComponentDto(c.name(), c.value(), c.riskPoints(), c.weight(), c.contribution())).toList(), r.reasons());
    }
}
