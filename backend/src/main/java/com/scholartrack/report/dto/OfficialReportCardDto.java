package com.scholartrack.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record OfficialReportCardDto(
        Long studentId,
        String rollNo,
        String fullName,
        String departmentName,
        String className,
        int semesterNo,
        String academicYear,
        LocalDate issueDate,
        String verificationCode,
        double sgpa,
        double cgpa,
        double attendancePercent,
        String attendanceStatus,
        int totalCreditsEarned,
        List<ReportCardSubjectItemDto> subjects,
        List<ReportCardFeeItemDto> fees
) {
    public record ReportCardSubjectItemDto(
            String code,
            String name,
            int credits,
            BigDecimal internalMarks,
            BigDecimal midtermMarks,
            BigDecimal totalMarks,
            BigDecimal maxMarks,
            double percentage,
            int gradePoint,
            String gradeLetter,
            String status
    ) {}

    public record ReportCardFeeItemDto(
            String title,
            BigDecimal total,
            BigDecimal paid,
            BigDecimal outstanding,
            String status
    ) {}
}
