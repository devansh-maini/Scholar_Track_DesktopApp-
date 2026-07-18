package com.scholartrack.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record DepartmentPerformanceReportDto(
        String departmentName,
        LocalDate generatedDate,
        int totalStudents,
        int totalTeachers,
        double averageCgpa,
        double averageAttendancePercent,
        int studentsBelow75Attendance,
        int highRiskStudentsCount,
        int mediumRiskStudentsCount,
        double assignmentCompletionPercent,
        BigDecimal totalOutstandingFees,
        List<SemesterSummaryRowDto> semesterSummaries,
        List<SubjectPerformanceRowDto> subjectPerformance,
        List<StudentRiskRankRowDto> studentPerformance
) {
    public record SemesterSummaryRowDto(
            String semesterLabel,
            int students,
            double avgAttendancePercent,
            double avgSgpa,
            double avgCgpa,
            int below75Count,
            int highRiskCount
    ) {}

    public record SubjectPerformanceRowDto(
            String code,
            String name,
            int semesterNo,
            double avgPercentage,
            double avgAttendancePercent,
            int assessedCount,
            int failingCount
    ) {}

    public record StudentRiskRankRowDto(
            String rollNo,
            String name,
            String className,
            double attendancePercent,
            double marksPercent,
            double sgpa,
            double cgpa,
            int riskScore,
            String riskLevel
    ) {}
}
