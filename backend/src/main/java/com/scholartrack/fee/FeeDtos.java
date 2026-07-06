package com.scholartrack.fee;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public final class FeeDtos {
    private FeeDtos() {}

    public record CreateFeeRequest(Long studentId, Long classId, @NotBlank @Size(max = 150) String title,
                                   @NotNull @DecimalMin(value = "0", inclusive = false) BigDecimal amount,
                                   @NotNull @DecimalMin("0") BigDecimal lateFee, @NotNull LocalDate dueDate) {}
    public record RecordPaymentRequest(@NotNull @DecimalMin(value = "0", inclusive = false) BigDecimal amount,
                                       @NotNull PaymentMethod method, @Size(max = 60) String reference) {}

    public record PaymentDto(Long id, BigDecimal amount, LocalDateTime paidAt, String method, String reference) {}
    public record FeeDto(Long id, Long studentId, String rollNo, String studentName, String title, BigDecimal totalAmount,
                         BigDecimal lateFeeApplied, BigDecimal paid, BigDecimal outstanding, String status,
                         LocalDate dueDate, List<PaymentDto> payments) {}
    public record MyFeesDto(BigDecimal totalBilled, BigDecimal totalPaid, BigDecimal totalOutstanding, List<FeeDto> fees) {}
    public record FeeSummaryDto(BigDecimal totalBilled, BigDecimal totalCollected, BigDecimal totalOutstanding,
                                long feeCount, long fullyPaidCount, long overdueCount) {}
}
