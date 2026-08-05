package com.scholartrack.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public record ExamPerformanceReportDto(
        Long classId,
        String className,
        Long subjectId,
        String subjectCode,
        String subjectName,
        LocalDate generatedDate,
        int totalStudents,
        int passedCount,
        int failedCount,
        double passPercentage,
        double averagePercentage,
        double highestPercentage,
        double lowestPercentage,
        Map<String, Integer> gradeDistribution,
        List<StudentScoreRowDto> studentScores
) {
    public record StudentScoreRowDto(
            String rollNo,
            String name,
            BigDecimal internalMarks,
            BigDecimal midtermMarks,
            BigDecimal totalMarks,
            BigDecimal maxMarks,
            double percentage,
            int gradePoint,
            String gradeLetter,
            String result
    ) {}
}

// Cohort pass/fail distributions: calculated from internal and midterm scores.

// Grade buckets: O (>=90), A+ (>=80), A (>=70), B+ (>=60), B (>=50), C (>=45), P (>=40), F (<40).
