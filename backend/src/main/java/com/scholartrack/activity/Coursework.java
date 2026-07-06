package com.scholartrack.activity;

import com.scholartrack.academic.ClassGroup;
import com.scholartrack.academic.Subject;
import com.scholartrack.academic.Teacher;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/** A teacher-created assignment (stored in the "assignments" table; named Coursework to avoid clashing with TeacherAssignment). */
@Entity
@Table(name = "assignments")
public class Coursework {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "subject_id") private Subject subject;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "class_group_id") private ClassGroup classGroup;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "teacher_id") private Teacher teacher;
    @Column(nullable = false, length = 150) private String title;
    @Column(length = 2000) private String description;
    @Column(nullable = false) private LocalDateTime deadline;
    @Column(name = "max_marks", nullable = false, precision = 6, scale = 2) private BigDecimal maxMarks;
    @Column(name = "created_at", nullable = false, updatable = false) private LocalDateTime createdAt;

    protected Coursework() {}
    public Coursework(Subject subject, ClassGroup classGroup, Teacher teacher, String title, String description,
                      LocalDateTime deadline, BigDecimal maxMarks) {
        this.subject = subject; this.classGroup = classGroup; this.teacher = teacher; this.title = title;
        this.description = description; this.deadline = deadline; this.maxMarks = maxMarks;
    }
    @PrePersist void onCreate() { createdAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public Subject getSubject() { return subject; }
    public ClassGroup getClassGroup() { return classGroup; }
    public Teacher getTeacher() { return teacher; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public LocalDateTime getDeadline() { return deadline; }
    public BigDecimal getMaxMarks() { return maxMarks; }
}
