package com.scholartrack.activity;

import java.util.List;

/**
 * Official, deterministic academic formulas. Reports, dashboards, analytics and AI context must all use these.
 *
 * Attendance % = attended / total * 100            (threshold 75%)
 * Classes needed for 75% = max(0, 3*total - 4*attended)   [smallest n with (a+n)/(t+n) >= 0.75]
 * Subject % = sum(marks) / sum(max marks) * 100
 * Grade point (10-point scale): >=90:10, >=80:9, >=70:8, >=60:7, >=50:6, >=45:5, >=40:4, else 0 (fail)
 * SGPA = sum(credits * gradePoint) / sum(credits)
 * CGPA = credit-weighted average of all semester SGPAs
 */
public final class AcademicCalc {
    private AcademicCalc() {}

    public static final double ATTENDANCE_THRESHOLD = 75.0;

    public record CreditGrade(int credits, int gradePoint) {}
    public record SemesterScore(double sgpa, int credits) {}

    public static double round2(double v) { return Math.round(v * 100.0) / 100.0; }

    public static double attendancePercent(int attended, int total) {
        return total == 0 ? 0.0 : round2(attended * 100.0 / total);
    }

    public static int classesNeededFor75(int attended, int total) {
        return Math.max(0, 3 * total - 4 * attended);
    }

    public static double percentage(double obtained, double max) {
        return max <= 0 ? 0.0 : round2(obtained * 100.0 / max);
    }

    public static int gradePoint(double pct) {
        if (pct >= 90) return 10;
        if (pct >= 80) return 9;
        if (pct >= 70) return 8;
        if (pct >= 60) return 7;
        if (pct >= 50) return 6;
        if (pct >= 45) return 5;
        if (pct >= 40) return 4;
        return 0;
    }

    /** SGPA formula: sum(credits * gradePoint) / sum(credits) */
    public static double sgpa(List<CreditGrade> grades) {
        int credits = grades.stream().mapToInt(CreditGrade::credits).sum();
        if (credits == 0) return 0.0;
        double points = grades.stream().mapToDouble(g -> (double) g.credits() * g.gradePoint()).sum();
        return round2(points / credits);
    }

    public static double cgpa(List<SemesterScore> semesters) {
        int credits = semesters.stream().mapToInt(SemesterScore::credits).sum();
        if (credits == 0) return 0.0;
        double points = semesters.stream().mapToDouble(s -> s.sgpa() * s.credits()).sum();
        return round2(points / credits);
    }
}
