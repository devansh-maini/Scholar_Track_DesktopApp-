package com.scholartrack.report;

import com.scholartrack.report.service.RiskCalc;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class RiskCalcTest {
    @Test
    void testPrdRiskCalculation() {
        // PRD example: attendance 61, midterm 42, assignments 60, previous CGPA 6.2
        int score = RiskCalc.calculateScore(61.0, 42.0, 60.0, 6.2, 0.0);
        assertTrue(score >= 55, "Score should be in HIGH risk bracket (>= 55)");
        assertEquals("HIGH", RiskCalc.level(score));
    }

    @Test
    void testLowRiskStudent() {
        int score = RiskCalc.calculateScore(95.0, 90.0, 95.0, 9.0, 0.0);
        assertEquals("LOW", RiskCalc.level(score));
    }
}
