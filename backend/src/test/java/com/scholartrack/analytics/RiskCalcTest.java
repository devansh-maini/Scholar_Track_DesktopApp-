package com.scholartrack.analytics;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class RiskCalcTest {
    @Test void prdExampleIsHighRisk() {
        // PRD example: attendance 61%, midterm 42%, assignments 60%, previous CGPA 6.2
        var r = RiskCalc.compute(new RiskCalc.Inputs(61.0, 42.0, 60.0, 6.2, 0.0));
        assertEquals(59, r.score());
        assertEquals("HIGH", r.level());
        assertFalse(r.reasons().isEmpty());
    }

    @Test void strongStudentIsLowRisk() {
        var r = RiskCalc.compute(new RiskCalc.Inputs(95.0, 90.0, 100.0, 9.0, 0.5));
        assertEquals(0, r.score());
        assertEquals("LOW", r.level());
        assertTrue(r.reasons().isEmpty());
    }

    @Test void borderlineStudentIsMediumRisk() {
        var r = RiskCalc.compute(new RiskCalc.Inputs(70.0, 55.0, 70.0, 6.8, -1.0));
        assertEquals(45, r.score());
        assertEquals("MEDIUM", r.level());
    }

    @Test void healthyStudentWithSmallGapsIsLow() {
        var r = RiskCalc.compute(new RiskCalc.Inputs(80.0, 65.0, 80.0, 7.2, -0.5));
        assertEquals(24, r.score());
        assertEquals("LOW", r.level());
    }

    @Test void missingDataContributesNothing() {
        var r = RiskCalc.compute(new RiskCalc.Inputs(null, null, null, null, null));
        assertEquals(0, r.score());
        assertEquals("LOW", r.level());
        assertEquals(5, r.components().size());
    }

    @Test void componentContributionsAddUpToScore() {
        var r = RiskCalc.compute(new RiskCalc.Inputs(61.0, 42.0, 60.0, 6.2, 0.0));
        double sum = r.components().stream().mapToDouble(RiskCalc.Component::contribution).sum();
        assertEquals(r.score(), sum, 1.0);
    }
}
