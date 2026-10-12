package com.scholartrack.activity;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.scholartrack.activity.AcademicCalc.CreditGrade;
import com.scholartrack.activity.AcademicCalc.SemesterScore;
import java.util.List;
import org.junit.jupiter.api.Test;

class AcademicCalcTest {
    @Test void attendancePercent() {
        assertEquals(0.0, AcademicCalc.attendancePercent(0, 0));
        assertEquals(60.0, AcademicCalc.attendancePercent(3, 5));
        assertEquals(85.71, AcademicCalc.attendancePercent(6, 7));
    }

    @Test void classesNeededFor75() {
        assertEquals(0, AcademicCalc.classesNeededFor75(0, 0));
        assertEquals(0, AcademicCalc.classesNeededFor75(15, 20));
        assertEquals(3, AcademicCalc.classesNeededFor75(3, 5));    // (3+3)/(5+3) = 75%
        assertEquals(6, AcademicCalc.classesNeededFor75(6, 10));   // (6+6)/(10+6) = 75%
        assertEquals(0, AcademicCalc.classesNeededFor75(9, 10));
    }

    @Test void gradePointBoundaries() {
        assertEquals(10, AcademicCalc.gradePoint(90));
        assertEquals(9, AcademicCalc.gradePoint(89.99));
        assertEquals(8, AcademicCalc.gradePoint(70));
        assertEquals(4, AcademicCalc.gradePoint(40));
        assertEquals(0, AcademicCalc.gradePoint(39.99));
    }

    @Test void percentage() {
        assertEquals(75.0, AcademicCalc.percentage(37.5, 50));
        assertEquals(0.0, AcademicCalc.percentage(10, 0));
    }

    @Test void sgpa() {
        assertEquals(8.18, AcademicCalc.sgpa(List.of(new CreditGrade(4, 10), new CreditGrade(4, 8), new CreditGrade(3, 6))));
        assertEquals(0.0, AcademicCalc.sgpa(List.of()));
    }

    @Test void cgpa() {
        assertEquals(8.5, AcademicCalc.cgpa(List.of(new SemesterScore(8.0, 22), new SemesterScore(9.0, 22))));
        assertEquals(0.0, AcademicCalc.cgpa(List.of()));
    }
}
