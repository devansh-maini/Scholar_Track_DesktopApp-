package com.scholartrack.notice;

import com.scholartrack.academic.*;
import com.scholartrack.common.ApiException;
import com.scholartrack.live.LiveEvent;
import com.scholartrack.live.LiveEventPublisher;
import com.scholartrack.notice.NoticeDtos.*;
import com.scholartrack.user.Role;
import com.scholartrack.user.User;
import com.scholartrack.user.UserRepository;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NoticeService {
    private final NoticeRepository notices;
    private final UserRepository users;
    private final StudentRepository students;
    private final TeacherRepository teachers;
    private final TeacherAssignmentRepository assignments;
    private final DepartmentRepository departments;
    private final ClassGroupRepository classes;
    private final SubjectRepository subjects;
    private final LiveEventPublisher live;

    public NoticeService(NoticeRepository notices, UserRepository users, StudentRepository students, TeacherRepository teachers,
                         TeacherAssignmentRepository assignments, DepartmentRepository departments, ClassGroupRepository classes,
                         SubjectRepository subjects, LiveEventPublisher live) {
        this.notices = notices; this.users = users; this.students = students; this.teachers = teachers;
        this.assignments = assignments; this.departments = departments; this.classes = classes; this.subjects = subjects;
        this.live = live;
    }

    /** Who a user "is" for notice targeting. */
    private record Audience(Role role, Set<Long> deptIds, Set<Long> classIds, Set<Integer> semesters, Set<Long> subjectIds) {
        boolean matches(NoticeTarget t, Long id) {
            return switch (t) {
                case ALL -> true;
                case STUDENTS -> role == Role.STUDENT;
                case TEACHERS -> role == Role.TEACHER;
                case DEPARTMENT -> id != null && deptIds.contains(id);
                case SEMESTER -> id != null && semesters.contains(id.intValue());
                case CLASS -> id != null && classIds.contains(id);
                case SUBJECT -> id != null && subjectIds.contains(id);
            };
        }
    }

    // ---------------- read ----------------
    @Transactional(readOnly = true)
    public List<NoticeDto> visible(String username, boolean includeExpired) {
        User u = user(username);
        Audience a = u.getRole() == Role.HOD ? null : audienceFor(u);
        LocalDate today = LocalDate.now();
        boolean seeExpired = includeExpired && u.getRole() == Role.HOD;
        return notices.findAllByOrderByCreatedAtDesc().stream()
                .filter(n -> seeExpired || !isExpired(n, today))
                .filter(n -> a == null || n.getAuthor().getId().equals(u.getId()) || a.matches(n.getTargetType(), n.getTargetId()))
                .sorted(Comparator.comparingInt((Notice n) -> -n.getPriority().ordinal()))   // URGENT first, newest first within a priority
                .map(n -> toDto(n, today))
                .toList();
    }

    // ---------------- write ----------------
    @Transactional
    public NoticeDto create(String username, CreateNoticeRequest r) {
        User u = user(username);
        LocalDate today = LocalDate.now();
        if (r.expiryDate() != null && r.expiryDate().isBefore(today)) throw bad("Expiry date cannot be in the past");
        validateTarget(u, r.targetType(), r.targetId());
        Notice n = notices.save(new Notice(u, r.title().trim(), r.description().trim(), r.expiryDate(), r.priority(),
                r.targetType(), r.targetType().ordinal() <= NoticeTarget.TEACHERS.ordinal() ? null : r.targetId()));
        live.toUsers(recipients(n), LiveEvent.of("NOTICE_PUBLISHED", "New notice: " + n.getTitle() + " (" + n.getPriority() + ")"));
        return toDto(n, today);
    }

    @Transactional
    public void delete(String username, Long id) {
        User u = user(username);
        Notice n = notices.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Notice not found"));
        if (u.getRole() != Role.HOD && !n.getAuthor().getId().equals(u.getId()))
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only delete your own notices");
        notices.delete(n);
    }

    // ---------------- targeting rules ----------------
    private void validateTarget(User u, NoticeTarget type, Long id) {
        boolean teacher = u.getRole() == Role.TEACHER;
        switch (type) {
            case ALL, STUDENTS, TEACHERS -> {
                if (id != null) throw bad("targetId is not allowed for " + type);
                if (teacher) throw forbidden();
            }
            case DEPARTMENT -> {
                requireId(id);
                if (teacher) throw forbidden();
                if (!departments.existsById(id)) throw new ApiException(HttpStatus.NOT_FOUND, "Department not found");
            }
            case SEMESTER -> {
                requireId(id);
                if (teacher) throw forbidden();
                if (id < 1 || id > 12) throw bad("Semester must be between 1 and 12");
            }
            case CLASS -> {
                requireId(id);
                if (!classes.existsById(id)) throw new ApiException(HttpStatus.NOT_FOUND, "Class not found");
                if (teacher && assignmentsOf(u).stream().noneMatch(ta -> ta.getClassGroup().getId().equals(id))) throw forbidden();
            }
            case SUBJECT -> {
                requireId(id);
                if (!subjects.existsById(id)) throw new ApiException(HttpStatus.NOT_FOUND, "Subject not found");
                if (teacher && assignmentsOf(u).stream().noneMatch(ta -> ta.getSubject().getId().equals(id))) throw forbidden();
            }
        }
    }

    private List<TeacherAssignment> assignmentsOf(User teacherUser) {
        Teacher t = teachers.findByUserId(teacherUser.getId()).orElseThrow(this::forbidden);
        return assignments.findByTeacherId(t.getId());
    }

    private Audience audienceFor(User u) {
        if (u.getRole() == Role.STUDENT) {
            Optional<Student> os = students.findByUserId(u.getId());
            if (os.isEmpty()) return new Audience(Role.STUDENT, Set.of(), Set.of(), Set.of(), Set.of());
            Student s = os.get();
            Set<Long> subs = assignments.findByClassGroupId(s.getClassGroup().getId()).stream()
                    .map(ta -> ta.getSubject().getId()).collect(Collectors.toSet());
            return new Audience(Role.STUDENT, Set.of(s.getDepartment().getId()), Set.of(s.getClassGroup().getId()),
                    Set.of(s.getClassGroup().getSemesterNo()), subs);
        }
        Optional<Teacher> ot = teachers.findByUserId(u.getId());
        if (ot.isEmpty()) return new Audience(Role.TEACHER, Set.of(), Set.of(), Set.of(), Set.of());
        Teacher t = ot.get();
        List<TeacherAssignment> tas = assignments.findByTeacherId(t.getId());
        return new Audience(Role.TEACHER, Set.of(t.getDepartment().getId()),
                tas.stream().map(ta -> ta.getClassGroup().getId()).collect(Collectors.toSet()),
                tas.stream().map(ta -> ta.getClassGroup().getSemesterNo()).collect(Collectors.toSet()),
                tas.stream().map(ta -> ta.getSubject().getId()).collect(Collectors.toSet()));
    }

    /** Everyone who matches the notice's audience (plus HODs and the author) - used for live push. */
    private List<String> recipients(Notice n) {
        Map<Long, Set<Long>> subjectsByClass = new HashMap<>();
        Map<Long, List<TeacherAssignment>> byTeacher = new HashMap<>();
        for (TeacherAssignment ta : assignments.findAll()) {
            subjectsByClass.computeIfAbsent(ta.getClassGroup().getId(), k -> new HashSet<>()).add(ta.getSubject().getId());
            byTeacher.computeIfAbsent(ta.getTeacher().getId(), k -> new ArrayList<>()).add(ta);
        }
        Set<String> out = new LinkedHashSet<>();
        for (Student s : students.findAll()) {
            Long cid = s.getClassGroup().getId();
            Audience a = new Audience(Role.STUDENT, Set.of(s.getDepartment().getId()), Set.of(cid),
                    Set.of(s.getClassGroup().getSemesterNo()), subjectsByClass.getOrDefault(cid, Set.of()));
            if (a.matches(n.getTargetType(), n.getTargetId())) out.add(s.getUser().getUsername());
        }
        for (Teacher t : teachers.findAll()) {
            List<TeacherAssignment> tas = byTeacher.getOrDefault(t.getId(), List.of());
            Audience a = new Audience(Role.TEACHER, Set.of(t.getDepartment().getId()),
                    tas.stream().map(ta -> ta.getClassGroup().getId()).collect(Collectors.toSet()),
                    tas.stream().map(ta -> ta.getClassGroup().getSemesterNo()).collect(Collectors.toSet()),
                    tas.stream().map(ta -> ta.getSubject().getId()).collect(Collectors.toSet()));
            if (a.matches(n.getTargetType(), n.getTargetId())) out.add(t.getUser().getUsername());
        }
        users.findByRoleAndActiveTrue(Role.HOD).forEach(h -> out.add(h.getUsername()));
        out.add(n.getAuthor().getUsername());
        return new ArrayList<>(out);
    }

    // ---------------- helpers ----------------
    private static boolean isExpired(Notice n, LocalDate today) { return n.getExpiryDate() != null && n.getExpiryDate().isBefore(today); }

    private NoticeDto toDto(Notice n, LocalDate today) {
        return new NoticeDto(n.getId(), n.getTitle(), n.getDescription(), n.getAuthor().getFullName(), n.getAuthor().getRole().name(),
                n.getCreatedAt(), n.getExpiryDate(), isExpired(n, today), n.getPriority(), n.getTargetType(), n.getTargetId(),
                label(n.getTargetType(), n.getTargetId()));
    }

    private String label(NoticeTarget t, Long id) {
        return switch (t) {
            case ALL -> "Everyone";
            case STUDENTS -> "All students";
            case TEACHERS -> "All teachers";
            case DEPARTMENT -> departments.findById(id).map(Department::getCode).orElse("Department");
            case SEMESTER -> "Semester " + id;
            case CLASS -> classes.findById(id).map(ClassGroup::getName).orElse("Class");
            case SUBJECT -> subjects.findById(id).map(Subject::getCode).orElse("Subject");
        };
    }

    private User user(String username) {
        return users.findByUsernameIgnoreCase(username).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required"));
    }
    private static void requireId(Long id) { if (id == null) throw bad("targetId is required for this target type"); }
    private static ApiException bad(String m) { return new ApiException(HttpStatus.BAD_REQUEST, m); }
    private ApiException forbidden() { return new ApiException(HttpStatus.FORBIDDEN, "You can only post notices to classes or subjects you teach"); }
}
