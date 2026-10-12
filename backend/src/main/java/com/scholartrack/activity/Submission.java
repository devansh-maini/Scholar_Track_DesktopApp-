package com.scholartrack.activity;

import com.scholartrack.academic.Student;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
public class Submission {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "assignment_id") private Coursework coursework;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "student_id") private Student student;
    @Column(nullable = false, length = 500) private String content;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 12) private SubmissionStatus status;
    @Column(name = "submitted_at", nullable = false) private LocalDateTime submittedAt;
    @Column(precision = 6, scale = 2) private BigDecimal marks;
    @Column(length = 1000) private String feedback;
    @Column(name = "evaluated_at") private LocalDateTime evaluatedAt;
    @Version private Long version;

    protected Submission() {}
    public Submission(Coursework coursework, Student student) { this.coursework = coursework; this.student = student; }

    public void submit(String content, LocalDateTime at, SubmissionStatus status) {
        this.content = content; this.submittedAt = at; this.status = status;
    }
    public void evaluate(BigDecimal marks, String feedback, LocalDateTime at) {
        this.marks = marks; this.feedback = feedback; this.evaluatedAt = at; this.status = SubmissionStatus.EVALUATED;
    }

    public Long getId() { return id; }
    public Coursework getCoursework() { return coursework; }
    public Student getStudent() { return student; }
    public String getContent() { return content; }
    public SubmissionStatus getStatus() { return status; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public BigDecimal getMarks() { return marks; }
    public String getFeedback() { return feedback; }
}
