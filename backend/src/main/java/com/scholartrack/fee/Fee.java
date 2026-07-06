package com.scholartrack.fee;

import com.scholartrack.academic.Student;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "fees")
public class Fee {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "student_id") private Student student;
    @Column(nullable = false, length = 150) private String title;
    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2) private BigDecimal totalAmount;
    @Column(name = "late_fee", nullable = false, precision = 10, scale = 2) private BigDecimal lateFee;
    @Column(name = "due_date", nullable = false) private LocalDate dueDate;
    @Column(name = "created_at", nullable = false, updatable = false) private LocalDateTime createdAt;
    @Column(name = "updated_at", nullable = false) private LocalDateTime updatedAt;
    @Version private Long version;

    protected Fee() {}
    public Fee(Student student, String title, BigDecimal totalAmount, BigDecimal lateFee, LocalDate dueDate) {
        this.student = student; this.title = title; this.totalAmount = totalAmount; this.lateFee = lateFee; this.dueDate = dueDate;
    }
    @PrePersist void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate void onUpdate() { updatedAt = LocalDateTime.now(); }
    /** Changing a field bumps @Version, so two people recording a payment at the same moment cannot both succeed. */
    public void touch() { this.updatedAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public Student getStudent() { return student; }
    public String getTitle() { return title; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public BigDecimal getLateFee() { return lateFee; }
    public LocalDate getDueDate() { return dueDate; }
}
