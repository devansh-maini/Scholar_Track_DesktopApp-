package com.scholartrack.academic;

import jakarta.persistence.*;

@Entity
@Table(name = "subjects")
public class Subject {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, unique = true, length = 20) private String code;
    @Column(nullable = false, length = 150) private String name;
    @Column(nullable = false) private int credits;
    @Column(name = "semester_no", nullable = false) private int semesterNo;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "department_id")
    private Department department;

    protected Subject() {}
    public Subject(String code, String name, int credits, int semesterNo, Department department) {
        this.code = code; this.name = name; this.credits = credits; this.semesterNo = semesterNo; this.department = department;
    }
    public Long getId() { return id; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public int getCredits() { return credits; }
    public int getSemesterNo() { return semesterNo; }
    public Department getDepartment() { return department; }
}
