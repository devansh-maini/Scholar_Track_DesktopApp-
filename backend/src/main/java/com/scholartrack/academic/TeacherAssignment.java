package com.scholartrack.academic;

import jakarta.persistence.*;

/** Who teaches which subject to which class. This is also how a class "has" subjects. */
@Entity
@Table(name = "teacher_assignments")
public class TeacherAssignment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "teacher_id") private Teacher teacher;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "subject_id") private Subject subject;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "class_group_id") private ClassGroup classGroup;

    protected TeacherAssignment() {}
    public TeacherAssignment(Teacher teacher, Subject subject, ClassGroup classGroup) {
        this.teacher = teacher; this.subject = subject; this.classGroup = classGroup;
    }
    public Long getId() { return id; }
    public Teacher getTeacher() { return teacher; }
    public Subject getSubject() { return subject; }
    public ClassGroup getClassGroup() { return classGroup; }
}
