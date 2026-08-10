package com.scholartrack.activity;

import com.scholartrack.academic.Student;
import jakarta.persistence.*;
import java.math.BigDecimal;

/** Stored SGPA of a completed (previous) semester. The current semester is always computed live from marks. */
@Entity
@Table(name = "semester_results")
public class SemesterResult {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "student_id") private Student student;
    @Column(name = "semester_no", nullable = false) private int semesterNo;
    @Column(nullable = false, precision = 4, scale = 2) private BigDecimal sgpa;
    @Column(nullable = false) private int credits;

    protected SemesterResult() {}
    public SemesterResult(Student student, int semesterNo, BigDecimal sgpa, int credits) {
        this.student = student; this.semesterNo = semesterNo; this.sgpa = sgpa; this.credits = credits;
    }
    public Student getStudent() { return student; }
    public int getSemesterNo() { return semesterNo; }
    public BigDecimal getSgpa() { return sgpa; }
    public int getCredits() { return credits; }
}
