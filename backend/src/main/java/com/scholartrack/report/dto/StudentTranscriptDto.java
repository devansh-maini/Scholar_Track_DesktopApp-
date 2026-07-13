package com.scholartrack.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record StudentTranscriptDto(
        Long studentId,
        String fullName,
        String rollNo,
        String className,
        int semesterNo,
        double sgpa,
        double cgpa,
        double overallAttendancePercent,
        int attendedClasses,
        int totalClasses,
        String riskLevel,
        int riskScore,
        LocalDate generatedDate,
        List<SubjectAttendanceItemDto> attendanceBySubject,
        List<SubjectResultItemDto> subjectResults,
        List<MarkItemDto> marks,
        List<PreviousSemesterScoreDto> previousSemesters,
        List<FeeItemDto> fees
) {
    public record SubjectAttendanceItemDto(
            String subjectName,
            int attended,
            int total,
            double percent,
            int classesNeededFor75
    ) {}

    public record SubjectResultItemDto(
            String subjectName,
            int credits,
            double percentage,
            int gradePoint
    ) {}

    public record MarkItemDto(
            String subjectCode,
            String assessmentType,
            BigDecimal marks,
            BigDecimal maxMarks
    ) {}

    public record PreviousSemesterScoreDto(
            String semesterLabel,
            double sgpa,
            int credits
    ) {}

    public record FeeItemDto(
            String feeTitle,
            BigDecimal totalAmount,
            BigDecimal lateFee,
            BigDecimal paidAmount,
            BigDecimal outstandingAmount,
            String status,
            LocalDate dueDate
    ) {}
}
