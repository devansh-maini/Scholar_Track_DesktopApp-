package com.scholartrack.activity;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public final class ActivityDtos {
    private ActivityDtos() {}

    // ---- attendance
    public record AttendanceRowDto(Long studentId, String rollNo, String fullName, String status) {}
    public record AttendanceEntry(@NotNull Long studentId, @NotNull AttendanceStatus status) {}
    public record MarkAttendanceRequest(@NotNull Long classId, @NotNull Long subjectId, @NotNull LocalDate date,
                                        @NotEmpty List<@Valid AttendanceEntry> records) {}
    public record SubjectAttendanceDto(Long subjectId, String subjectCode, String subjectName, int attended, int total,
                                       double percent, int classesNeededFor75) {}
    public record AttendanceSummaryDto(int attended, int total, double percent, boolean lowAttendance,
                                       List<SubjectAttendanceDto> subjects) {}

    // ---- marks
    public record MarkEntry(@NotNull Long studentId, @NotNull @DecimalMin("0") BigDecimal marks) {}
    public record SaveMarksRequest(@NotNull Long classId, @NotNull Long subjectId, @NotNull AssessmentType assessmentType,
                                   @NotNull @DecimalMin(value = "0", inclusive = false) BigDecimal maxMarks,
                                   @NotEmpty List<@Valid MarkEntry> entries) {}
    public record MarkDto(Long id, Long studentId, String rollNo, String studentName, Long subjectId, String subjectCode,
                          AssessmentType assessmentType, BigDecimal marks, BigDecimal maxMarks) {}

    // ---- results
    public record SubjectResultDto(Long subjectId, String subjectCode, String subjectName, int credits, double percentage, int gradePoint) {}
    public record PreviousSemesterDto(int semesterNo, double sgpa, int credits) {}
    public record ResultDto(int semesterNo, double sgpa, double cgpa, List<SubjectResultDto> subjects, List<PreviousSemesterDto> previous) {}
    public record PerformanceDto(Long studentId, String rollNo, String fullName, String className, int semesterNo,
                                 AttendanceSummaryDto attendance, ResultDto results) {}

    // ---- coursework (assignments + submissions)
    public record CreateCourseworkRequest(@NotNull Long classId, @NotNull Long subjectId,
                                          @NotBlank @Size(max = 150) String title, @Size(max = 2000) String description,
                                          @NotNull LocalDateTime deadline,
                                          @NotNull @DecimalMin(value = "0", inclusive = false) BigDecimal maxMarks) {}
    public record CourseworkDto(Long id, Long subjectId, String subjectCode, String subjectName, Long classId, String className,
                                String title, String description, LocalDateTime deadline, BigDecimal maxMarks, int submissionCount) {}
    public record MyCourseworkDto(Long id, String subjectCode, String subjectName, String teacherName, String title, String description,
                                  LocalDateTime deadline, BigDecimal maxMarks, String status, BigDecimal marks, String feedback,
                                  LocalDateTime submittedAt) {}
    public record SubmitRequest(@NotBlank @Size(max = 500) String content) {}
    public record SubmissionDto(Long id, Long courseworkId, Long studentId, String rollNo, String studentName, String content,
                                String status, LocalDateTime submittedAt, BigDecimal marks, String feedback) {}
    public record EvaluateRequest(@NotNull @DecimalMin("0") BigDecimal marks, @Size(max = 1000) String feedback) {}
}
