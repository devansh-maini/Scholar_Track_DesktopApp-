package com.scholartrack.academic;

import com.scholartrack.academic.AcademicDtos.*;
import com.scholartrack.common.ApiResponse;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class AcademicController {
    private final AcademicService svc;
    public AcademicController(AcademicService svc) { this.svc = svc; }

    // ---------- readable by any logged-in user ----------
    @GetMapping("/departments")
    public ApiResponse<List<DepartmentDto>> departments() { return ApiResponse.ok("Departments", svc.listDepartments()); }

    @GetMapping("/subjects")
    public ApiResponse<List<SubjectDto>> subjects(@RequestParam(required = false) Integer semesterNo) {
        return ApiResponse.ok("Subjects", svc.listSubjects(semesterNo));
    }

    @GetMapping("/classes")
    public ApiResponse<List<ClassDto>> classes() { return ApiResponse.ok("Classes", svc.listClasses()); }

    // ---------- HOD only (route group /api/v1/hod/** is HOD-only in SecurityConfig) ----------
    @PostMapping("/hod/departments") @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<DepartmentDto> createDepartment(@Valid @RequestBody CreateDepartmentRequest r) {
        return ApiResponse.ok("Department created", svc.createDepartment(r));
    }

    @PostMapping("/hod/subjects") @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SubjectDto> createSubject(@Valid @RequestBody CreateSubjectRequest r) {
        return ApiResponse.ok("Subject created", svc.createSubject(r));
    }

    @PostMapping("/hod/classes") @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ClassDto> createClass(@Valid @RequestBody CreateClassRequest r) {
        return ApiResponse.ok("Class created", svc.createClass(r));
    }

    @PostMapping("/hod/students") @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<StudentDto> createStudent(@Valid @RequestBody CreateStudentRequest r) {
        return ApiResponse.ok("Student created", svc.createStudent(r));
    }

    @PostMapping("/hod/teachers") @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TeacherDto> createTeacher(@Valid @RequestBody CreateTeacherRequest r) {
        return ApiResponse.ok("Teacher created", svc.createTeacher(r));
    }

    @PostMapping("/hod/assignments") @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AssignmentDto> createAssignment(@Valid @RequestBody CreateAssignmentRequest r) {
        return ApiResponse.ok("Assignment created", svc.createAssignment(r));
    }

    @GetMapping("/hod/students")
    public ApiResponse<PageDto<StudentDto>> students(@RequestParam(defaultValue = "") String q,
                                                     @RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok("Students", svc.searchStudents(q, page, size));
    }

    @GetMapping("/hod/teachers")
    public ApiResponse<List<TeacherDto>> teachers() { return ApiResponse.ok("Teachers", svc.listTeachers()); }

    @GetMapping("/hod/assignments")
    public ApiResponse<List<AssignmentDto>> assignments() { return ApiResponse.ok("Assignments", svc.listAssignments()); }

    // ---------- Student: own data (profile and subjects) ----------
    // Retrieves all subjects and assigned teachers for current student's class group
    @GetMapping("/students/me") @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<StudentDto> studentMe(Principal p) { return ApiResponse.ok("My profile", svc.studentMe(p.getName())); }

    @GetMapping("/students/me/subjects") @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<List<AssignmentDto>> studentSubjects(Principal p) {
        return ApiResponse.ok("My subjects", svc.studentSubjects(p.getName()));
    }

    // ---------- Teacher: assigned data ----------
    @GetMapping("/teachers/me") @PreAuthorize("hasRole('TEACHER')")
    public ApiResponse<TeacherDto> teacherMe(Principal p) { return ApiResponse.ok("My profile", svc.teacherMe(p.getName())); }

    @GetMapping("/teachers/me/assignments") @PreAuthorize("hasRole('TEACHER')")
    public ApiResponse<List<AssignmentDto>> teacherAssignments(Principal p) {
        return ApiResponse.ok("My assignments", svc.teacherAssignments(p.getName()));
    }

    @GetMapping("/teachers/me/classes/{classId}/students") @PreAuthorize("hasAnyRole('TEACHER','HOD')")
    public ApiResponse<List<StudentDto>> classStudents(@PathVariable Long classId, Principal p) {
        return ApiResponse.ok("Class students", svc.classStudents(p.getName(), classId));
    }
}
