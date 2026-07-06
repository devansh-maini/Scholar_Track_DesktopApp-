package com.scholartrack.activity;

import com.scholartrack.academic.Student;
import com.scholartrack.academic.Subject;
import com.scholartrack.academic.Teacher;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "marks")
public class Mark {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "student_id") private Student student;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "subject_id") private Subject subject;
    @Enumerated(EnumType.STRING) @Column(name = "assessment_type", nullable = false, length = 20) private AssessmentType assessmentType;
    @Column(nullable = false, precision = 6, scale = 2) private BigDecimal marks;
    @Column(name = "max_marks", nullable = false, precision = 6, scale = 2) private BigDecimal maxMarks;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "recorded_by") private Teacher recordedBy;
    @Column(name = "created_at", nullable = false, updatable = false) private LocalDateTime createdAt;
    @Column(name = "updated_at", nullable = false) private LocalDateTime updatedAt;
    @Version private Long version;

    protected Mark() {}
    public Mark(Student student, Subject subject, AssessmentType type) {
        this.student = student; this.subject = subject; this.assessmentType = type;
    }
    @PrePersist void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate void onUpdate() { updatedAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public Student getStudent() { return student; }
    public Subject getSubject() { return subject; }
    public AssessmentType getAssessmentType() { return assessmentType; }
    public BigDecimal getMarks() { return marks; }
    public BigDecimal getMaxMarks() { return maxMarks; }
    public void setScore(BigDecimal marks, BigDecimal maxMarks, Teacher by) { this.marks = marks; this.maxMarks = maxMarks; this.recordedBy = by; }
}
