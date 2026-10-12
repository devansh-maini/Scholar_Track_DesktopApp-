package com.scholartrack.analytics;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public final class AnalyticsDtos {
    private AnalyticsDtos() {}

    public record RiskComponentDto(String name, Double value, double riskPoints, double weight, double contribution) {}
    public record RiskDto(int score, String level, List<RiskComponentDto> components, List<String> reasons) {}
    public record StudentRowDto(Long studentId, String rollNo, String name, String className, int semesterNo, int attended, int total,
                                double attendancePct, boolean lowAttendance, double marksPct, double sgpa, double cgpa,
                                double assignmentCompletionPct, int riskScore, String riskLevel) {}
    public record RiskDetailDto(StudentRowDto student, RiskDto risk, Double previousCgpa, Double sgpaTrend) {}
    public record ActivityItemDto(String type, String text, LocalDateTime at) {}
    public record DashboardDto(int totalStudents, int totalTeachers, double averageCgpa, double averageAttendance,
                               int lowAttendanceCount, int highRiskCount, int mediumRiskCount, double assignmentCompletionPct,
                               BigDecimal outstandingFees, long overdueFeeCount, long openComplaints, List<ActivityItemDto> recentActivity) {}
    public record SemesterStatDto(int semesterNo, int students, double averageAttendance, double averageSgpa, double averageCgpa,
                                  int lowAttendanceCount, int highRiskCount) {}
    public record ClassStatDto(Long classId, String className, int semesterNo, int students, double averageAttendance,
                               double averageMarksPct, double averageSgpa, double assignmentCompletionPct) {}
    public record SubjectStatDto(Long subjectId, String code, String name, int semesterNo, int credits, double averagePercentage,
                                 double averageAttendance, int studentsAssessed, int failingCount) {}
    public record AttendancePointDto(LocalDate date, int present, int total, double percent) {}
}
