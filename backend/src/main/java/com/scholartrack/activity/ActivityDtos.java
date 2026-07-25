package com.scholartrack.activity;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
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
}
