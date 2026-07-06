package com.scholartrack.fee;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class FeeCalcTest {
    private static final LocalDate TODAY = LocalDate.of(2026, 10, 9);
    private static BigDecimal d(String v) { return new BigDecimal(v).setScale(2); }

    @Test void pendingBeforeDue() {
        var s = FeeCalc.summarize(d("1000"), d("100"), TODAY.plusDays(5), d("0"), TODAY);
        assertEquals(FeeCalc.Status.PENDING, s.status());
        assertEquals(d("1000"), s.outstanding());
    }
    @Test void partialBeforeDue() {
        var s = FeeCalc.summarize(d("1000"), d("100"), TODAY.plusDays(5), d("400"), TODAY);
        assertEquals(FeeCalc.Status.PARTIALLY_PAID, s.status());
        assertEquals(d("600"), s.outstanding());
    }
    @Test void overdueAddsLateFee() {
        var s = FeeCalc.summarize(d("1000"), d("100"), TODAY.minusDays(1), d("0"), TODAY);
        assertEquals(FeeCalc.Status.OVERDUE, s.status());
        assertEquals(d("100"), s.lateFeeApplied());
        assertEquals(d("1100"), s.outstanding());
    }
    @Test void partialAfterDueStillOverdue() {
        var s = FeeCalc.summarize(d("1000"), d("100"), TODAY.minusDays(1), d("500"), TODAY);
        assertEquals(FeeCalc.Status.OVERDUE, s.status());
        assertEquals(d("600"), s.outstanding());
    }
    @Test void fullyPaidLateHasNoLateFee() {
        var s = FeeCalc.summarize(d("1000"), d("100"), TODAY.minusDays(10), d("1000"), TODAY);
        assertEquals(FeeCalc.Status.PAID, s.status());
        assertEquals(d("0"), s.lateFeeApplied());
        assertEquals(d("0"), s.outstanding());
    }
}
