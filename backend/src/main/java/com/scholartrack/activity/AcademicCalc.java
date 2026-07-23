package com.scholartrack.activity;

public final class AcademicCalc {
    private AcademicCalc() {}

    public static final double ATTENDANCE_THRESHOLD = 75.0;

    /** Attendance % = attended / total * 100. Returns 100.0 if no classes have occurred yet. */
    public static double attendancePercent(int attended, int total) {
        if (total <= 0) return 100.0;
        return Math.round((attended * 1000.0) / total) / 10.0;
    }

    /**
     * Classes needed to reach >= 75%:
     * (attended + x) / (total + x) >= 0.75  <=>  4(attended + x) >= 3(total + x)  <=>  x >= 3*total - 4*attended.
     */
    public static int classesNeededFor75(int attended, int total) {
        if (total <= 0) return 0;
        int needed = 3 * total - 4 * attended;
        return Math.max(0, needed);
    }
}
