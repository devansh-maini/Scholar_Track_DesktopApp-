package com.scholartrack.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record FeePaymentAuditReportDto(
        String reportTitle,
        LocalDate generatedDate,
        BigDecimal totalBilled,
        BigDecimal totalCollected,
        BigDecimal totalOutstanding,
        int feesFullyPaidCount,
        int totalFeesCount,
        int overdueCount,
        List<FeeAuditRowDto> fees
) {
    public record FeeAuditRowDto(
            String rollNo,
            String name,
            String feeTitle,
            BigDecimal totalAmount,
            BigDecimal lateFee,
            BigDecimal paidAmount,
            BigDecimal outstandingAmount,
            String status,
            LocalDate dueDate
    ) {}
}
