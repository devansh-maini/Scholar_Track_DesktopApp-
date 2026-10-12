package com.scholartrack.analytics;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Academic risk indicator: transparent, rule-based (NOT machine learning). One formula for the HOD dashboard,
 * student view, reports and AI context.
 *
 * Each input becomes "risk points" 0..100 (linear), then a weighted sum gives the 0..100 score:
 *   attendance   35%   0 pts at >= 90%,  100 pts at <= 45%
 *   marks        30%   0 pts at >= 80%,  100 pts at <= 30%
 *   assignments  15%   0 pts at >= 90% submitted, 100 pts at <= 30%
 *   prior CGPA   10%   0 pts at >= 8.0, 100 pts at <= 5.0
 *   trend        10%   0 pts when SGPA is flat/rising, 100 pts when SGPA fell by 2.0 or more
 * Missing data contributes 0 points. Level: HIGH >= 55, MEDIUM >= 30, otherwise LOW.
 */
public final class RiskCalc {
    private RiskCalc() {}

    public static final double W_ATTENDANCE = 0.35, W_MARKS = 0.30, W_ASSIGNMENTS = 0.15, W_PREVIOUS = 0.10, W_TREND = 0.10;
    public static final int HIGH_THRESHOLD = 55, MEDIUM_THRESHOLD = 30;

    public record Inputs(Double attendancePct, Double marksPct, Double assignmentPct, Double previousCgpa, Double trend) {}
    public record Component(String name, Double value, double riskPoints, double weight, double contribution) {}
    public record Result(int score, String level, List<Component> components, List<String> reasons) {}

    private static double clamp01(double v) { return Math.max(0.0, Math.min(1.0, v)); }
    private static double round1(double v) { return Math.round(v * 10.0) / 10.0; }

    public static Result compute(Inputs in) {
        double rA = in.attendancePct() == null ? 0 : clamp01((90.0 - in.attendancePct()) / 45.0) * 100;
        double rM = in.marksPct() == null ? 0 : clamp01((80.0 - in.marksPct()) / 50.0) * 100;
        double rC = in.assignmentPct() == null ? 0 : clamp01((90.0 - in.assignmentPct()) / 60.0) * 100;
        double rG = in.previousCgpa() == null ? 0 : clamp01((8.0 - in.previousCgpa()) / 3.0) * 100;
        double rT = in.trend() == null ? 0 : clamp01(-in.trend() / 2.0) * 100;

        double total = rA * W_ATTENDANCE + rM * W_MARKS + rC * W_ASSIGNMENTS + rG * W_PREVIOUS + rT * W_TREND;
        int score = (int) Math.round(total);
        String level = score >= HIGH_THRESHOLD ? "HIGH" : score >= MEDIUM_THRESHOLD ? "MEDIUM" : "LOW";

        List<Component> comps = List.of(
                new Component("Attendance", in.attendancePct(), round1(rA), W_ATTENDANCE, round1(rA * W_ATTENDANCE)),
                new Component("Marks", in.marksPct(), round1(rM), W_MARKS, round1(rM * W_MARKS)),
                new Component("Assignments", in.assignmentPct(), round1(rC), W_ASSIGNMENTS, round1(rC * W_ASSIGNMENTS)),
                new Component("Previous CGPA", in.previousCgpa(), round1(rG), W_PREVIOUS, round1(rG * W_PREVIOUS)),
                new Component("SGPA trend", in.trend(), round1(rT), W_TREND, round1(rT * W_TREND)));

        List<String> reasons = new ArrayList<>();
        if (rA * W_ATTENDANCE >= 5) reasons.add(String.format(Locale.ROOT, in.attendancePct() < 75
                ? "Attendance is %.1f%%, below the 75%% requirement" : "Attendance is %.1f%%, lower than the 90%% comfort level", in.attendancePct()));
        if (rM * W_MARKS >= 5) reasons.add(String.format(Locale.ROOT, "Marks average only %.1f%%", in.marksPct()));
        if (rC * W_ASSIGNMENTS >= 3) reasons.add(String.format(Locale.ROOT, "Only %.0f%% of assignments submitted", in.assignmentPct()));
        if (rG * W_PREVIOUS >= 3) reasons.add(String.format(Locale.ROOT, "Previous CGPA %.2f is below 8.0", in.previousCgpa()));
        if (rT * W_TREND >= 3) reasons.add(String.format(Locale.ROOT, "SGPA fell by %.2f compared with the last semester", -in.trend()));
        return new Result(score, level, comps, reasons);
    }
}
