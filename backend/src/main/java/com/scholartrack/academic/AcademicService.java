package com.scholartrack.academic;

import com.scholartrack.academic.AcademicDtos.*;
import com.scholartrack.common.ApiException;
import com.scholartrack.user.Role;
import com.scholartrack.user.User;
import com.scholartrack.user.UserRepository;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AcademicService {
    private final DepartmentRepository departments;
    private final SubjectRepository subjects;
    private final ClassGroupRepository classes;
    private final StudentRepository students;
    private final TeacherRepository teachers;
    private final TeacherAssignmentRepository assignments;
    private final UserRepository users;
    private final PasswordEncoder encoder;

    public AcademicService(DepartmentRepository departments, SubjectRepository subjects, ClassGroupRepository classes,
                           StudentRepository students, TeacherRepository teachers,
                           TeacherAssignmentRepository assignments, UserRepository users, PasswordEncoder encoder) {
        this.departments = departments; this.subjects = subjects; this.classes = classes; this.students = students;
        this.teachers = teachers; this.assignments = assignments; this.users = users; this.encoder = encoder;
    }

    // ======================= shared reads =======================
    @Transactional(readOnly = true)
    public List<DepartmentDto> listDepartments() {
        return departments.findAll(Sort.by("code")).stream().map(d -> toDto(d)).toList();
    }

    @Transactional(readOnly = true)
    public List<SubjectDto> listSubjects(Integer semesterNo) {
        List<Subject> list = semesterNo == null ? subjects.findAll(Sort.by("code"))
                                                : subjects.findBySemesterNoOrderByCode(semesterNo);
        return list.stream().map(s -> toDto(s)).toList();
    }

    @Transactional(readOnly = true)
    public List<ClassDto> listClasses() {
        return classes.findAll(Sort.by("name")).stream().map(c -> toDto(c)).toList();
    }

    // ======================= HOD: create =======================
    @Transactional
    public DepartmentDto createDepartment(CreateDepartmentRequest r) {
        String code = r.code().trim().toUpperCase();
        if (departments.existsByCodeIgnoreCase(code)) throw conflict("Department code already exists");
        return toDto(departments.save(new Department(code, r.name().trim())));
    }

    @Transactional
    public SubjectDto createSubject(CreateSubjectRequest r) {
        String code = r.code().trim().toUpperCase();
        if (subjects.existsByCodeIgnoreCase(code)) throw conflict("Subject code already exists");
        Department d = departments.findById(r.departmentId()).orElseThrow(() -> notFound("Department not found"));
        return toDto(subjects.save(new Subject(code, r.name().trim(), r.credits(), r.semesterNo(), d)));
    }

    @Transactional
    public ClassDto createClass(CreateClassRequest r) {
        if (classes.existsByNameIgnoreCaseAndAcademicYear(r.name().trim(), r.academicYear().trim()))
            throw conflict("Class already exists for that academic year");
        Department d = departments.findById(r.departmentId()).orElseThrow(() -> notFound("Department not found"));
        return toDto(classes.save(new ClassGroup(r.name().trim(), r.section().trim().toUpperCase(),
                r.semesterNo(), r.academicYear().trim(), d)));
    }

    @Transactional
    public StudentDto createStudent(CreateStudentRequest r) {
        ClassGroup cg = classes.findById(r.classId()).orElseThrow(() -> notFound("Class not found"));
        String roll = r.rollNo().trim().toUpperCase();
        if (students.existsByRollNo(roll)) throw conflict("Roll number already exists");
        User u = newUser(r.username(), r.email(), r.fullName(), r.password(), Role.STUDENT);
        return toDto(students.save(new Student(u, roll, cg.getDepartment(), cg)));
    }

    @Transactional
    public TeacherDto createTeacher(CreateTeacherRequest r) {
        Department d = departments.findById(r.departmentId()).orElseThrow(() -> notFound("Department not found"));
        String code = r.employeeCode().trim().toUpperCase();
        if (teachers.existsByEmployeeCode(code)) throw conflict("Employee code already exists");
        User u = newUser(r.username(), r.email(), r.fullName(), r.password(), Role.TEACHER);
        return toDto(teachers.save(new Teacher(u, code, d)));
    }

    @Transactional
    public AssignmentDto createAssignment(CreateAssignmentRequest r) {
        Teacher t = teachers.findById(r.teacherId()).orElseThrow(() -> notFound("Teacher not found"));
        Subject s = subjects.findById(r.subjectId()).orElseThrow(() -> notFound("Subject not found"));
        ClassGroup c = classes.findById(r.classId()).orElseThrow(() -> notFound("Class not found"));
        if (assignments.existsByTeacherIdAndSubjectIdAndClassGroupId(t.getId(), s.getId(), c.getId()))
            throw conflict("This assignment already exists");
        return toDto(assignments.save(new TeacherAssignment(t, s, c)));
    }

    // ======================= HOD: read =======================
    @Transactional(readOnly = true)
    public PageDto<StudentDto> searchStudents(String q, int page, int size) {
        int safeSize = Math.max(1, Math.min(size, 100));
        Page<Student> p = students.search(q == null ? "" : q.trim(),
                PageRequest.of(Math.max(page, 0), safeSize, Sort.by("rollNo")));
        return new PageDto<>(p.getContent().stream().map(s -> toDto(s)).toList(),
                p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages());
    }

    @Transactional(readOnly = true)
    public List<TeacherDto> listTeachers() {
        return teachers.findAll(Sort.by("employeeCode")).stream().map(t -> toDto(t)).toList();
    }

    @Transactional(readOnly = true)
    public List<AssignmentDto> listAssignments() {
        return assignments.findAll().stream().map(a -> toDto(a)).toList();
    }

    // ======================= Student: own data only =======================
    @Transactional(readOnly = true)
    public StudentDto studentMe(String username) {
        return toDto(studentByUsername(username));
    }

    @Transactional(readOnly = true)
    public List<AssignmentDto> studentSubjects(String username) {
        Student s = studentByUsername(username);
        return assignments.findByClassGroupId(s.getClassGroup().getId()).stream().map(a -> toDto(a)).toList();
    }

    // ======================= Teacher: assigned data only =======================
    @Transactional(readOnly = true)
    public TeacherDto teacherMe(String username) {
        return toDto(teacherByUsername(username));
    }

    @Transactional(readOnly = true)
    public List<AssignmentDto> teacherAssignments(String username) {
        Teacher t = teacherByUsername(username);
        return assignments.findByTeacherId(t.getId()).stream().map(a -> toDto(a)).toList();
    }

    @Transactional(readOnly = true)
    public List<StudentDto> classStudents(String username, Long classId) {
        User u = userByName(username);
        if (u.getRole() == Role.TEACHER) {   // HOD may view any class; a teacher only classes they are assigned to
            Teacher t = teachers.findByUserId(u.getId()).orElseThrow(() -> forbidden("You are not assigned to this class"));
            if (!assignments.existsByTeacherIdAndClassGroupId(t.getId(), classId))
                throw forbidden("You are not assigned to this class");
        }
        if (!classes.existsById(classId)) throw notFound("Class not found");
        return students.findByClassGroupIdOrderByRollNo(classId).stream().map(s -> toDto(s)).toList();
    }

    // ======================= helpers =======================
    private User newUser(String username, String email, String fullName, String password, Role role) {
        if (users.existsByUsernameIgnoreCase(username.trim())) throw conflict("Username already exists");
        if (users.existsByEmailIgnoreCase(email.trim())) throw conflict("Email already exists");
        User u = new User();
        u.setUsername(username.trim()); u.setEmail(email.trim()); u.setFullName(fullName.trim());
        u.setRole(role); u.setPasswordHash(encoder.encode(password));
        return users.save(u);
    }

    private User userByName(String username) {
        return users.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required"));
    }
    private Student studentByUsername(String username) {
        return students.findByUserId(userByName(username).getId())
                .orElseThrow(() -> notFound("Student profile not found"));
    }
    private Teacher teacherByUsername(String username) {
        return teachers.findByUserId(userByName(username).getId())
                .orElseThrow(() -> notFound("Teacher profile not found"));
    }

    private static ApiException notFound(String m) { return new ApiException(HttpStatus.NOT_FOUND, m); }
    private static ApiException conflict(String m) { return new ApiException(HttpStatus.CONFLICT, m); }
    private static ApiException forbidden(String m) { return new ApiException(HttpStatus.FORBIDDEN, m); }

    private static DepartmentDto toDto(Department d) { return new DepartmentDto(d.getId(), d.getCode(), d.getName()); }
    private static SubjectDto toDto(Subject s) {
        return new SubjectDto(s.getId(), s.getCode(), s.getName(), s.getCredits(), s.getSemesterNo(), s.getDepartment().getId());
    }
    private static ClassDto toDto(ClassGroup c) {
        return new ClassDto(c.getId(), c.getName(), c.getSection(), c.getSemesterNo(), c.getAcademicYear(), c.getDepartment().getId());
    }
    private static StudentDto toDto(Student s) {
        User u = s.getUser();
        return new StudentDto(s.getId(), u.getId(), u.getUsername(), u.getFullName(), u.getEmail(), s.getRollNo(),
                s.getDepartment().getCode(), s.getClassGroup().getId(), s.getClassGroup().getName(), s.getClassGroup().getSemesterNo());
    }
    private static TeacherDto toDto(Teacher t) {
        User u = t.getUser();
        return new TeacherDto(t.getId(), u.getId(), u.getUsername(), u.getFullName(), u.getEmail(),
                t.getEmployeeCode(), t.getDepartment().getCode());
    }
    private static AssignmentDto toDto(TeacherAssignment a) {
        return new AssignmentDto(a.getId(), a.getTeacher().getId(), a.getTeacher().getUser().getFullName(),
                a.getSubject().getId(), a.getSubject().getCode(), a.getSubject().getName(),
                a.getClassGroup().getId(), a.getClassGroup().getName());
    }
}
