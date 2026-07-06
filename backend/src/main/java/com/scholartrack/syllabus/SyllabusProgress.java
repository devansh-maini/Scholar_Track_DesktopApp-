package com.scholartrack.syllabus;

import com.scholartrack.academic.ClassGroup;
import com.scholartrack.academic.Teacher;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "syllabus_progress")
public class SyllabusProgress {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "topic_id") private SyllabusTopic topic;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "class_group_id") private ClassGroup classGroup;
    @Column(nullable = false) private boolean completed;
    @Column(name = "completed_on") private LocalDate completedOn;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "updated_by") private Teacher updatedBy;
    @Column(name = "updated_at", nullable = false) private LocalDateTime updatedAt;

    protected SyllabusProgress() {}
    public SyllabusProgress(SyllabusTopic topic, ClassGroup classGroup) { this.topic = topic; this.classGroup = classGroup; }

    public void mark(boolean completed, Teacher by) {
        this.completed = completed;
        this.completedOn = completed ? LocalDate.now() : null;
        this.updatedBy = by;
        this.updatedAt = LocalDateTime.now();
    }
    public Long getId() { return id; }
    public SyllabusTopic getTopic() { return topic; }
    public ClassGroup getClassGroup() { return classGroup; }
    public boolean isCompleted() { return completed; }
    public LocalDate getCompletedOn() { return completedOn; }
}
