package com.scholartrack.report.dto;

import java.time.LocalDate;
import java.util.List;

public record AssignmentCompletionReportDto(
        Long classId,
        String className,
        LocalDate generatedDate,
        int totalAssignments,
        int totalSubmissionsExpected,
        int totalSubmissionsReceived,
        double completionRatePercent,
        List<AssignmentCompletionRowDto> items
) {
    public record AssignmentCompletionRowDto(
            Long courseworkId,
            String title,
            String subjectCode,
            LocalDate deadline,
            int maxMarks,
            int submissionCount,
            int totalEnrolled,
            double completionPercent
    ) {}
}
