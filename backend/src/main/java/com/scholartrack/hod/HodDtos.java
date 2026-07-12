package com.scholartrack.hod;

import java.util.List;

/** DTOs scoped to HOD module. */
public final class HodDtos {
    private HodDtos() {}

    // Department overview
    public record DepartmentOverviewDto(
            String hodName,
            int totalStudents,
            int totalTeachers,
            int atRiskStudents,
            double avgAttendance,
            double avgMarks,
            List<DepartmentStatsDto> departments) {}

    public record DepartmentStatsDto(
            Long id,
            String code,
            String name,
            int totalStudents,
            int totalTeachers,
            int atRiskStudents,
            double avgAttendance,
            double avgMarks) {}

    // Teacher allocation
    public record TeacherAllocationDto(
            Long teacherId,
            String fullName,
            String email,
            String employeeCode,
            String departmentName,
            List<SubjectClassDto> allocations) {}

    public record SubjectClassDto(
            Long subjectId,
            String subjectCode,
            String subjectName,
            Long classId,
            String className) {}

    // Syllabus audit row
    public record SyllabusAuditDto(
            Long subjectId,
            String subjectCode,
            String subjectName,
            Long classId,
            String className,
            int topicsTotal,
            int topicsDone,
            double percentComplete) {}

    // At-risk student
    public record AtRiskStudentDto(
            Long studentId,
            String fullName,
            String rollNo,
            String department,
            String className,
            double attendancePct,
            double avgMarks,
            String riskLevel,
            List<String> reasons) {}

    // HOD circular / notice creation (reuses existing notice endpoint, no duplicate table)
    public record CircularRequest(
            String title,
            String description,
            String priority,
            String targetType,
            Long targetId,
            String expiryDate) {}
}
