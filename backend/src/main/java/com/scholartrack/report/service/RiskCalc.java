package com.scholartrack.report.service;

public final class RiskCalc {
    private RiskCalc() {}

    public static int calculateScore(double attendancePct, double marksPct, double assignmentsPct, double cgpa, double sgpaDrop) {
        double attRisk = linearMap(attendancePct, 90.0, 45.0);
        double markRisk = linearMap(marksPct, 80.0, 30.0);
        double assignRisk = linearMap(assignmentsPct, 90.0, 30.0);
        double cgpaRisk = linearMap(cgpa, 8.0, 5.0);
        double trendRisk = Math.min(100.0, Math.max(0.0, sgpaDrop * 50.0));

        double weighted = (attRisk * 0.35) + (markRisk * 0.30) + (assignRisk * 0.15) + (cgpaRisk * 0.10) + (trendRisk * 0.10);
        return (int) Math.round(weighted);
    }

    public static String level(int score) {
        if (score >= 55) return "HIGH";
        if (score >= 30) return "MEDIUM";
        return "LOW";
    }

    private static double linearMap(double val, double zeroRisk, double fullRisk) {
        if (val >= zeroRisk) return 0.0;
        if (val <= fullRisk) return 100.0;
        return (zeroRisk - val) / (zeroRisk - fullRisk) * 100.0;
    }
}
