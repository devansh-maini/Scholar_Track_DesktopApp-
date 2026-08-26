package com.scholartrack.academic;

import com.scholartrack.user.User;
import jakarta.persistence.*;

@Entity
@Table(name = "teachers")
public class Teacher {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @OneToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id") private User user;
    @Column(name = "employee_code", nullable = false, unique = true, length = 30) private String employeeCode;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "department_id") private Department department;

    protected Teacher() {}
    public Teacher(User user, String employeeCode, Department department) {
        this.user = user; this.employeeCode = employeeCode; this.department = department;
    }
    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getEmployeeCode() { return employeeCode; }
    public Department getDepartment() { return department; }
}
