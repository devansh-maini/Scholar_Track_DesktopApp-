package com.scholartrack.academic;

import jakarta.persistence.*;

@Entity
@Table(name = "class_groups")
public class ClassGroup {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 80) private String name;
    @Column(nullable = false, length = 10) private String section;
    @Column(name = "semester_no", nullable = false) private int semesterNo;
    @Column(name = "academic_year", nullable = false, length = 20) private String academicYear;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "department_id")
    private Department department;

    protected ClassGroup() {}
    public ClassGroup(String name, String section, int semesterNo, String academicYear, Department department) {
        this.name = name; this.section = section; this.semesterNo = semesterNo;
        this.academicYear = academicYear; this.department = department;
    }
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getSection() { return section; }
    public int getSemesterNo() { return semesterNo; }
    public String getAcademicYear() { return academicYear; }
    public Department getDepartment() { return department; }
}
