package com.scholartrack.activity;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class AcademicCalcTest {
    @Test
    void attendance_percentage_rounded_to_one_decimal() {
        assertEquals(100.0, AcademicCalc.attendancePercent(0, 0));
        assertEquals(85.7, AcademicCalc.attendancePercent(6, 7));
        assertEquals(75.0, AcademicCalc.attendancePercent(15, 20));
        assertEquals(0.0, AcademicCalc.attendancePercent(0, 10));
    }

    @Test
    void classes_needed_for_75_percent() {
        assertEquals(0, AcademicCalc.classesNeededFor75(15, 20)); // exactly 75%
        assertEquals(0, AcademicCalc.classesNeededFor75(16, 20)); // 80%
        assertEquals(5, AcademicCalc.classesNeededFor75(10, 15)); // (3*15 - 4*10) = 5
        assertEquals(0, AcademicCalc.classesNeededFor75(0, 0));
    }
}
