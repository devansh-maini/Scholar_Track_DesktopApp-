package com.scholartrack.activity;

import com.scholartrack.academic.*;
import com.scholartrack.activity.ActivityDtos.*;
import com.scholartrack.common.ApiException;
import com.scholartrack.live.LiveEvent;
import com.scholartrack.live.LiveEventPublisher;
import com.scholartrack.user.User;
import com.scholartrack.user.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ActivityService {
    private final AttendanceRepository attendance;
    private final MarkRepository marks;
    private final CourseworkRepository coursework;
    private final SubmissionRepository submissions;
    private final SemesterResultRepository semesterResults;
    private final StudentRepository students;
    private final TeacherRepository teachers;
    private final SubjectRepository subjects;
    private final ClassGroupRepository classes;
    private final TeacherAssignmentRepository assignments;
    private final UserRepository users;
    private final LiveEventPublisher live;

    public ActivityService(AttendanceRepository attendance, MarkRepository marks, CourseworkRepository coursework,
                           SubmissionRepository submissions, SemesterResultRepository semesterResults,
                           StudentRepository students, TeacherRepository teachers, SubjectRepository subjects,
                           ClassGroupRepository classes, TeacherAssignmentRepository assignments, UserRepository users,
                           LiveEventPublisher live) {
        this.attendance = attendance; this.marks = marks; this.coursework = coursework; this.submissions = submissions;
        this.semesterResults = semesterResults; this.students = students; this.teachers = teachers; this.subjects = subjects;
        this.classes = classes; this.assignments = assignments; this.users = users; this.live = live;
    }

    // =============================== TEACHER: attendance ===============================
    @Transactional(readOnly = true)
    public List<AttendanceRowDto> attendanceSheet(String username, Long classId, Long subjectId, LocalDate date) {
        Teacher t = teacherFor(username);
        requireAssigned(t, subjectId, classId);
        LocalDate d = date == null ? LocalDate.now() : date;
        Map<Long, AttendanceStatus> existing = attendance.findBySubjectIdAndAttendanceDate(subjectId, d).stream()
                .collect(Collectors.toMap(a -> a.getStudent().getId(), AttendanceRecord::getStatus, (x, y) -> y));
        return students.findByClassGroupIdOrderByRollNo(classId).stream()
                .map(s -> new AttendanceRowDto(s.getId(), s.getRollNo(), s.getUser().getFullName(),
                        existing.containsKey(s.getId()) ? existing.get(s.getId()).name() : null))
                .toList();
    }

    /** All-or-nothing: every entry is validated before anything is saved. Re-marking the same day updates the records. */
    @Transactional
    public int markAttendance(String username, MarkAttendanceRequest r) {
        Teacher t = teacherFor(username);
        requireAssigned(t, r.subjectId(), r.classId());
        if (r.date().isAfter(LocalDate.now())) throw bad("Attendance date cannot be in the future");
        Subject subject = subjects.findById(r.subjectId()).orElseThrow(() -> notFound("Subject not found"));
        Map<Long, Student> inClass = classStudentMap(r.classId());
        Set<Long> seen = new HashSet<>();
        for (AttendanceEntry e : r.records()) {
            if (!inClass.containsKey(e.studentId())) throw bad("Student " + e.studentId() + " is not in this class");
            if (!seen.add(e.studentId())) throw bad("Student " + e.studentId() + " appears more than once");
        }
        for (AttendanceEntry e : r.records()) {
            AttendanceRecord rec = attendance
                    .findByStudentIdAndSubjectIdAndAttendanceDate(e.studentId(), r.subjectId(), r.date())
                    .orElseGet(() -> new AttendanceRecord(inClass.get(e.studentId()), subject, r.date(), e.status(), t));
            rec.setStatus(e.status());
            rec.setMarkedBy(t);
            attendance.save(rec);
        }
        String msg = subject.getCode() + " attendance updated for " + r.date();
        live.toUsers(r.records().stream().map(e -> inClass.get(e.studentId()).getUser().getUsername()).toList(),
                LiveEvent.of("ATTENDANCE_UPDATED", msg));
        live.toHods(LiveEvent.of("ATTENDANCE_UPDATED", msg));
        return r.records().size();
    }

    // =============================== TEACHER: marks ===============================
    @Transactional
    public int saveMarks(String username, SaveMarksRequest r) {
        Teacher t = teacherFor(username);
        requireAssigned(t, r.subjectId(), r.classId());
        Subject subject = subjects.findById(r.subjectId()).orElseThrow(() -> notFound("Subject not found"));
        Map<Long, Student> inClass = classStudentMap(r.classId());
        Set<Long> seen = new HashSet<>();
        for (MarkEntry e : r.entries()) {
            if (!inClass.containsKey(e.studentId())) throw bad("Student " + e.studentId() + " is not in this class");
            if (!seen.add(e.studentId())) throw bad("Student " + e.studentId() + " appears more than once");
            if (e.marks().compareTo(r.maxMarks()) > 0)
                throw bad("Marks for student " + e.studentId() + " must be between 0 and " + r.maxMarks().stripTrailingZeros().toPlainString());
        }
        for (MarkEntry e : r.entries()) {
            Mark m = marks.findByStudentIdAndSubjectIdAndAssessmentType(e.studentId(), r.subjectId(), r.assessmentType())
                    .orElseGet(() -> new Mark(inClass.get(e.studentId()), subject, r.assessmentType()));
            m.setScore(e.marks(), r.maxMarks(), t);
            marks.save(m);
        }
        String msg = subject.getCode() + " " + r.assessmentType() + " marks updated";
        live.toUsers(r.entries().stream().map(e -> inClass.get(e.studentId()).getUser().getUsername()).toList(),
                LiveEvent.of("MARKS_UPDATED", msg));
        live.toHods(LiveEvent.of("MARKS_UPDATED", msg));
        return r.entries().size();
    }

    @Transactional(readOnly = true)
    public List<MarkDto> classMarks(String username, Long classId, Long subjectId) {
        Teacher t = teacherFor(username);
        requireAssigned(t, subjectId, classId);
        return marks.findBySubjectIdAndStudentClassGroupIdOrderByStudentRollNo(subjectId, classId).stream()
                .map(m -> toDto(m)).toList();
    }

    // =============================== TEACHER: coursework ===============================
    @Transactional
    public CourseworkDto createCoursework(String username, CreateCourseworkRequest r) {
        Teacher t = teacherFor(username);
        requireAssigned(t, r.subjectId(), r.classId());
        if (!r.deadline().isAfter(LocalDateTime.now())) throw bad("Deadline must be in the future");
        Subject s = subjects.findById(r.subjectId()).orElseThrow(() -> notFound("Subject not found"));
        ClassGroup c = classes.findById(r.classId()).orElseThrow(() -> notFound("Class not found"));
        Coursework cw = coursework.save(new Coursework(s, c, t, r.title().trim(), r.description(), r.deadline(), r.maxMarks()));
        live.toClass(c.getId(), LiveEvent.of("ASSIGNMENT_CREATED", "New assignment: " + cw.getTitle() + " (" + s.getCode() + ")"));
        return toDto(cw, 0);
    }

    @Transactional(readOnly = true)
    public List<CourseworkDto> teacherCoursework(String username) {
        Teacher t = teacherFor(username);
        return coursework.findByTeacherIdOrderByDeadlineDesc(t.getId()).stream()
                .map(cw -> toDto(cw, (int) submissions.countByCourseworkId(cw.getId()))).toList();
    }

    @Transactional(readOnly = true)
    public List<SubmissionDto> courseworkSubmissions(String username, Long courseworkId) {
        Teacher t = teacherFor(username);
        Coursework cw = coursework.findById(courseworkId).orElseThrow(() -> notFound("Assignment not found"));
        requireAssigned(t, cw.getSubject().getId(), cw.getClassGroup().getId());
        return submissions.findByCourseworkId(courseworkId).stream()
                .sorted(Comparator.comparing(s -> s.getStudent().getRollNo()))
                .map(s -> toDto(s)).toList();
    }

    @Transactional
    public SubmissionDto evaluate(String username, Long courseworkId, Long submissionId, EvaluateRequest r) {
        Teacher t = teacherFor(username);
        Coursework cw = coursework.findById(courseworkId).orElseThrow(() -> notFound("Assignment not found"));
        requireAssigned(t, cw.getSubject().getId(), cw.getClassGroup().getId());
        Submission s = submissions.findById(submissionId).orElseThrow(() -> notFound("Submission not found"));
        if (!s.getCoursework().getId().equals(courseworkId)) throw notFound("Submission not found");
        if (r.marks().compareTo(cw.getMaxMarks()) > 0)
            throw bad("Marks must be between 0 and " + cw.getMaxMarks().stripTrailingZeros().toPlainString());
        s.evaluate(r.marks(), r.feedback(), LocalDateTime.now());
        live.toUser(s.getStudent().getUser().getUsername(),
                LiveEvent.of("SUBMISSION_EVALUATED", cw.getTitle() + " evaluated: " + r.marks().stripTrailingZeros().toPlainString() + "/" + cw.getMaxMarks().stripTrailingZeros().toPlainString()));
        return toDto(submissions.save(s));
    }

    // =============================== STUDENT ===============================
    @Transactional(readOnly = true)
    public AttendanceSummaryDto myAttendance(String username) { return attendanceSummary(studentFor(username)); }

    @Transactional(readOnly = true)
    /** Query all marks recorded for authenticated student, sorted by subject code. */
    public List<MarkDto> myMarks(String username) {
        return marks.findByStudentId(studentFor(username).getId()).stream().map(m -> toDto(m))
                .sorted(Comparator.comparing(MarkDto::subjectCode).thenComparing(m -> m.assessmentType().name()))
                .toList();
    }

    @Transactional(readOnly = true)
    public ResultDto myResults(String username) { return results(studentFor(username)); }

    @Transactional(readOnly = true)
    public List<MyCourseworkDto> myCoursework(String username) {
        Student s = studentFor(username);
        Map<Long, Submission> mine = submissions.findByStudentId(s.getId()).stream()
                .collect(Collectors.toMap(x -> x.getCoursework().getId(), x -> x, (a, b) -> a));
        return coursework.findByClassGroupIdOrderByDeadlineAsc(s.getClassGroup().getId()).stream().map(cw -> {
            Submission sub = mine.get(cw.getId());
            return new MyCourseworkDto(cw.getId(), cw.getSubject().getCode(), cw.getSubject().getName(),
                    cw.getTeacher().getUser().getFullName(), cw.getTitle(), cw.getDescription(), cw.getDeadline(), cw.getMaxMarks(),
                    sub == null ? "PENDING" : sub.getStatus().name(),
                    sub == null ? null : sub.getMarks(), sub == null ? null : sub.getFeedback(),
                    sub == null ? null : sub.getSubmittedAt());
        }).toList();
    }

    @Transactional
    public SubmissionDto submit(String username, Long courseworkId, SubmitRequest r) {
        Student s = studentFor(username);
        Coursework cw = coursework.findById(courseworkId).orElseThrow(() -> notFound("Assignment not found"));
        if (!cw.getClassGroup().getId().equals(s.getClassGroup().getId())) throw notFound("Assignment not found");
        Submission sub = submissions.findByCourseworkIdAndStudentId(courseworkId, s.getId())
                .orElseGet(() -> new Submission(cw, s));
        if (sub.getStatus() == SubmissionStatus.EVALUATED) throw new ApiException(HttpStatus.CONFLICT, "This submission has already been evaluated");
        LocalDateTime now = LocalDateTime.now();
        sub.submit(r.content().trim(), now, now.isAfter(cw.getDeadline()) ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED);
        live.toUser(cw.getTeacher().getUser().getUsername(),
                LiveEvent.of("SUBMISSION_RECEIVED", s.getUser().getFullName() + " submitted " + cw.getTitle()));
        return toDto(submissions.save(sub));
    }

    // =============================== HOD ===============================
    @Transactional(readOnly = true)
    public PerformanceDto performance(Long studentId) {
        Student s = students.findById(studentId).orElseThrow(() -> notFound("Student not found"));
        ResultDto res = results(s);
        return new PerformanceDto(s.getId(), s.getRollNo(), s.getUser().getFullName(), s.getClassGroup().getName(),
                s.getClassGroup().getSemesterNo(), attendanceSummary(s), res);
    }

    /** Marks of any student (used by reports and AI context; callers must already be authorised). */
    @Transactional(readOnly = true)
    public List<MarkDto> marksOf(Long studentId) {
        return marks.findByStudentId(studentId).stream().map(m -> toDto(m))
                .sorted(Comparator.comparing(MarkDto::subjectCode).thenComparing(m -> m.assessmentType().name()))
                .toList();
    }

    // =============================== calculations glue ===============================
    private AttendanceSummaryDto attendanceSummary(Student s) {
        Map<Long, long[]> counts = new HashMap<>();   // subjectId -> [attended, total]
        for (Object[] row : attendance.countBySubject(s.getId()))
            counts.put((Long) row[0], new long[]{((Number) row[2]).longValue(), ((Number) row[1]).longValue()});
        List<SubjectAttendanceDto> list = new ArrayList<>();
        Set<Long> seen = new HashSet<>();
        int attendedAll = 0, totalAll = 0;
        for (TeacherAssignment ta : assignments.findByClassGroupId(s.getClassGroup().getId())) {
            Subject sub = ta.getSubject();
            if (!seen.add(sub.getId())) continue;
            long[] c = counts.getOrDefault(sub.getId(), new long[]{0, 0});
            int attended = (int) c[0], total = (int) c[1];
            attendedAll += attended; totalAll += total;
            list.add(new SubjectAttendanceDto(sub.getId(), sub.getCode(), sub.getName(), attended, total,
                    AcademicCalc.attendancePercent(attended, total), AcademicCalc.classesNeededFor75(attended, total)));
        }
        double pct = AcademicCalc.attendancePercent(attendedAll, totalAll);
        return new AttendanceSummaryDto(attendedAll, totalAll, pct, totalAll > 0 && pct < AcademicCalc.ATTENDANCE_THRESHOLD, list);
    }

    private ResultDto results(Student s) {
        ClassGroup cg = s.getClassGroup();
        Map<Long, List<Mark>> bySubject = marks.findByStudentId(s.getId()).stream()
                .collect(Collectors.groupingBy(m -> m.getSubject().getId()));
        List<SubjectResultDto> subs = new ArrayList<>();
        List<AcademicCalc.CreditGrade> grades = new ArrayList<>();
        Set<Long> seen = new HashSet<>();
        for (TeacherAssignment ta : assignments.findByClassGroupId(cg.getId())) {
            Subject sub = ta.getSubject();
            if (!seen.add(sub.getId())) continue;
            List<Mark> ml = bySubject.get(sub.getId());
            if (ml == null || ml.isEmpty()) continue;
            double obtained = ml.stream().mapToDouble(m -> m.getMarks().doubleValue()).sum();
            double max = ml.stream().mapToDouble(m -> m.getMaxMarks().doubleValue()).sum();
            double pct = AcademicCalc.percentage(obtained, max);
            int gp = AcademicCalc.gradePoint(pct);
            subs.add(new SubjectResultDto(sub.getId(), sub.getCode(), sub.getName(), sub.getCredits(), pct, gp));
            grades.add(new AcademicCalc.CreditGrade(sub.getCredits(), gp));
        }
        double sgpa = AcademicCalc.sgpa(grades);
        int currentCredits = grades.stream().mapToInt(AcademicCalc.CreditGrade::credits).sum();
        List<SemesterResult> prev = semesterResults
                .findByStudentIdAndSemesterNoLessThanOrderBySemesterNo(s.getId(), cg.getSemesterNo());
        List<AcademicCalc.SemesterScore> scores = new ArrayList<>();
        List<PreviousSemesterDto> prevDtos = new ArrayList<>();
        for (SemesterResult p : prev) {
            scores.add(new AcademicCalc.SemesterScore(p.getSgpa().doubleValue(), p.getCredits()));
            prevDtos.add(new PreviousSemesterDto(p.getSemesterNo(), p.getSgpa().doubleValue(), p.getCredits()));
        }
        if (currentCredits > 0) scores.add(new AcademicCalc.SemesterScore(sgpa, currentCredits));
        return new ResultDto(cg.getSemesterNo(), sgpa, AcademicCalc.cgpa(scores), subs, prevDtos);
    }

    // =============================== helpers ===============================
    private Teacher teacherFor(String username) {
        User u = users.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required"));
        return teachers.findByUserId(u.getId()).orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "Teacher profile required"));
    }

    private Student studentFor(String username) {
        User u = users.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required"));
        return students.findByUserId(u.getId()).orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "Student profile required"));
    }

    private void requireAssigned(Teacher t, Long subjectId, Long classId) {
        if (!assignments.existsByTeacherIdAndSubjectIdAndClassGroupId(t.getId(), subjectId, classId))
            throw new ApiException(HttpStatus.FORBIDDEN, "You are not assigned to this subject and class");
    }

    private Map<Long, Student> classStudentMap(Long classId) {
        return students.findByClassGroupIdOrderByRollNo(classId).stream()
                .collect(Collectors.toMap(Student::getId, s -> s, (a, b) -> a, LinkedHashMap::new));
    }

    private static ApiException bad(String m) { return new ApiException(HttpStatus.BAD_REQUEST, m); }
    private static ApiException notFound(String m) { return new ApiException(HttpStatus.NOT_FOUND, m); }

    private static MarkDto toDto(Mark m) {
        return new MarkDto(m.getId(), m.getStudent().getId(), m.getStudent().getRollNo(), m.getStudent().getUser().getFullName(),
                m.getSubject().getId(), m.getSubject().getCode(), m.getAssessmentType(), m.getMarks(), m.getMaxMarks());
    }
    private static CourseworkDto toDto(Coursework cw, int count) {
        return new CourseworkDto(cw.getId(), cw.getSubject().getId(), cw.getSubject().getCode(), cw.getSubject().getName(),
                cw.getClassGroup().getId(), cw.getClassGroup().getName(), cw.getTitle(), cw.getDescription(),
                cw.getDeadline(), cw.getMaxMarks(), count);
    }
    private static SubmissionDto toDto(Submission s) {
        return new SubmissionDto(s.getId(), s.getCoursework().getId(), s.getStudent().getId(), s.getStudent().getRollNo(),
                s.getStudent().getUser().getFullName(), s.getContent(), s.getStatus().name(), s.getSubmittedAt(),
                s.getMarks(), s.getFeedback());
    }
}
