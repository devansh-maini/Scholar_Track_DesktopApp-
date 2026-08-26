package com.scholartrack.academic;

import jakarta.validation.constraints.*;
import java.util.List;

public final class AcademicDtos {
    private AcademicDtos() {}

    // ---- responses
    public record DepartmentDto(Long id, String code, String name) {}
    public record SubjectDto(Long id, String code, String name, int credits, int semesterNo, Long departmentId) {}
    public record ClassDto(Long id, String name, String section, int semesterNo, String academicYear, Long departmentId) {}
    public record StudentDto(Long id, Long userId, String username, String fullName, String email, String rollNo,
                             String departmentCode, Long classId, String className, int semesterNo) {}
    public record TeacherDto(Long id, Long userId, String username, String fullName, String email,
                             String employeeCode, String departmentCode) {}
    public record AssignmentDto(Long id, Long teacherId, String teacherName, Long subjectId, String subjectCode,
                                String subjectName, Long classId, String className) {}
    public record PageDto<T>(List<T> content, int page, int size, long totalElements, int totalPages) {}

    // ---- requests
    public record CreateDepartmentRequest(@NotBlank @Size(max = 20) String code, @NotBlank @Size(max = 120) String name) {}
    public record CreateSubjectRequest(@NotBlank @Size(max = 20) String code, @NotBlank @Size(max = 150) String name,
                                       @Min(1) @Max(10) int credits, @Min(1) @Max(12) int semesterNo,
                                       @NotNull Long departmentId) {}
    public record CreateClassRequest(@NotBlank @Size(max = 80) String name, @NotBlank @Size(max = 10) String section,
                                     @Min(1) @Max(12) int semesterNo, @NotBlank @Size(max = 20) String academicYear,
                                     @NotNull Long departmentId) {}
    public record CreateStudentRequest(@NotBlank @Size(min = 3, max = 50) String username, @NotBlank @Email String email,
                                       @NotBlank @Size(max = 120) String fullName, @NotBlank @Size(min = 6, max = 72) String password,
                                       @NotBlank @Size(max = 30) String rollNo, @NotNull Long classId) {}
    public record CreateTeacherRequest(@NotBlank @Size(min = 3, max = 50) String username, @NotBlank @Email String email,
                                       @NotBlank @Size(max = 120) String fullName, @NotBlank @Size(min = 6, max = 72) String password,
                                       @NotBlank @Size(max = 30) String employeeCode, @NotNull Long departmentId) {}
    public record CreateAssignmentRequest(@NotNull Long teacherId, @NotNull Long subjectId, @NotNull Long classId) {}
}
