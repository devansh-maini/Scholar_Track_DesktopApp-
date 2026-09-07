package com.scholartrack.fee;

import com.scholartrack.user.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "fee_id") private Fee fee;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal amount;
    @Column(name = "paid_at", nullable = false) private LocalDateTime paidAt;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private PaymentMethod method;
    @Column(name = "payment_ref", length = 60) private String paymentRef;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "recorded_by") private User recordedBy;
    @Column(name = "created_at", nullable = false, updatable = false) private LocalDateTime createdAt;

    protected Payment() {}
    public Payment(Fee fee, BigDecimal amount, LocalDateTime paidAt, PaymentMethod method, String paymentRef, User recordedBy) {
        this.fee = fee; this.amount = amount; this.paidAt = paidAt; this.method = method; this.paymentRef = paymentRef; this.recordedBy = recordedBy;
    }
    @PrePersist void onCreate() { createdAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public Fee getFee() { return fee; }
    public BigDecimal getAmount() { return amount; }
    public LocalDateTime getPaidAt() { return paidAt; }
    public PaymentMethod getMethod() { return method; }
    public String getPaymentRef() { return paymentRef; }
}
