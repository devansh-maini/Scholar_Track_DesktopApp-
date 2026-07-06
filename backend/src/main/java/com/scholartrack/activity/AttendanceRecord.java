package com.scholartrack.activity;

import com.scholartrack.academic.Student;
import com.scholartrack.academic.Subject;
import com.scholartrack.academic.Teacher;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_records")
public class AttendanceRecord {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "student_id") private Student student;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "subject_id") private Subject subject;
    @Column(name = "attendance_date", nullable = false) private LocalDate attendanceDate;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 10) private AttendanceStatus status;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "marked_by") private Teacher markedBy;
    @Column(name = "created_at", nullable = false, updatable = false) private LocalDateTime createdAt;
    @Column(name = "updated_at", nullable = false) private LocalDateTime updatedAt;
    @Version private Long version;

    protected AttendanceRecord() {}
    public AttendanceRecord(Student student, Subject subject, LocalDate date, AttendanceStatus status, Teacher markedBy) {
        this.student = student; this.subject = subject; this.attendanceDate = date; this.status = status; this.markedBy = markedBy;
    }
    @PrePersist void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate void onUpdate() { updatedAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public Student getStudent() { return student; }
    public Subject getSubject() { return subject; }
    public LocalDate getAttendanceDate() { return attendanceDate; }
    public AttendanceStatus getStatus() { return status; }
    public void setStatus(AttendanceStatus s) { this.status = s; }
    public Teacher getMarkedBy() { return markedBy; }
    public void setMarkedBy(Teacher t) { this.markedBy = t; }
}
