package com.scholartrack.academic;

import com.scholartrack.user.User;
import jakarta.persistence.*;

@Entity
@Table(name = "students")
public class Student {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @OneToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id") private User user;
    @Column(name = "roll_no", nullable = false, unique = true, length = 30) private String rollNo;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "department_id") private Department department;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "class_group_id") private ClassGroup classGroup;

    protected Student() {}
    public Student(User user, String rollNo, Department department, ClassGroup classGroup) {
        this.user = user; this.rollNo = rollNo; this.department = department; this.classGroup = classGroup;
    }
    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getRollNo() { return rollNo; }
    public Department getDepartment() { return department; }
    public ClassGroup getClassGroup() { return classGroup; }
}
