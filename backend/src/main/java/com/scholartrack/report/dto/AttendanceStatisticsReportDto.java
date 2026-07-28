package com.scholartrack.report.dto;

import java.time.LocalDate;
import java.util.List;

public record AttendanceStatisticsReportDto(
        String className,
        LocalDate generatedDate,
        int totalStudents,
        double averageAttendancePercent,
        int below75Count,
        List<StudentAttendanceRowDto> studentAttendance
) {
    public record StudentAttendanceRowDto(
            String rollNo,
            String name,
            String className,
            int attended,
            int total,
            double percent,
            String status
    ) {}
}

// Chronic absenteeism: students falling below 75% threshold flagged for dean review.
