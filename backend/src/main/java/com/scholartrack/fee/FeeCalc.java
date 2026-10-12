package com.scholartrack.fee;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Official fee rules (pure, unit-tested).
 *  - late fee applies only when today is after the due date AND the base fee is not fully paid
 *  - outstanding = max(0, total + lateFeeApplied - paid)
 *  - PAID: nothing outstanding | OVERDUE: outstanding after the due date | PARTIALLY_PAID: some paid before due | PENDING: none paid before due
 */
public final class FeeCalc {
    private FeeCalc() {}

    public enum Status { PAID, PARTIALLY_PAID, PENDING, OVERDUE }
    public record Summary(BigDecimal total, BigDecimal lateFeeApplied, BigDecimal paid, BigDecimal outstanding, Status status) {}

    public static Summary summarize(BigDecimal total, BigDecimal lateFee, LocalDate dueDate, BigDecimal paid, LocalDate today) {
        BigDecimal zero = BigDecimal.ZERO.setScale(2);
        boolean overdue = today.isAfter(dueDate);
        BigDecimal lateApplied = (overdue && paid.compareTo(total) < 0) ? lateFee : zero;
        BigDecimal outstanding = total.add(lateApplied).subtract(paid).max(zero);
        Status status;
        if (outstanding.signum() == 0) status = Status.PAID;
        else if (overdue) status = Status.OVERDUE;
        else if (paid.signum() > 0) status = Status.PARTIALLY_PAID;
        else status = Status.PENDING;
        return new Summary(total, lateApplied, paid, outstanding, status);
    }
}
