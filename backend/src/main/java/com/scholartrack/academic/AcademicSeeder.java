package com.scholartrack.academic;

import com.scholartrack.user.Role;
import com.scholartrack.user.User;
import com.scholartrack.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/** Demo academic data: 1 department, 5 subjects, 2 classes, 10 students, 2 teachers. Runs once on an empty academic schema. */
@Component
@Order(2)
public class AcademicSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(AcademicSeeder.class);
    private final DepartmentRepository departments;
    private final SubjectRepository subjects;
    private final ClassGroupRepository classes;
    private final StudentRepository students;
    private final TeacherRepository teachers;
    private final TeacherAssignmentRepository assignments;
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final boolean enabled;

    public AcademicSeeder(DepartmentRepository departments, SubjectRepository subjects, ClassGroupRepository classes,
                          StudentRepository students, TeacherRepository teachers, TeacherAssignmentRepository assignments,
                          UserRepository users, PasswordEncoder encoder, @Value("${scholartrack.seed-demo}") boolean enabled) {
        this.departments = departments; this.subjects = subjects; this.classes = classes; this.students = students;
        this.teachers = teachers; this.assignments = assignments; this.users = users; this.encoder = encoder;
        this.enabled = enabled;
    }

    @Override
    public void run(String... args) {
        if (!enabled || departments.count() > 0) return;

        Department cse = departments.save(new Department("CSE", "Computer Science & Engineering"));

        Subject aoa = subjects.save(new Subject("CS501", "Analysis of Algorithms", 4, 5, cse));
        Subject dbms = subjects.save(new Subject("CS502", "Database Management Systems", 4, 5, cse));
        Subject os = subjects.save(new Subject("CS503", "Operating Systems", 4, 5, cse));
        Subject cn = subjects.save(new Subject("CS504", "Computer Networks", 3, 5, cse));
        Subject se = subjects.save(new Subject("CS505", "Software Engineering", 3, 5, cse));

        ClassGroup a = classes.save(new ClassGroup("CSE-A", "A", 5, "2026-27", cse));
        ClassGroup b = classes.save(new ClassGroup("CSE-B", "B", 5, "2026-27", cse));

        Teacher t1 = teachers.save(new Teacher(
                ensureUser("teacher", "teacher@scholartrack.local", "Prof. Rahul Verma", Role.TEACHER, "teacher123"), "EMP101", cse));
        Teacher t2 = teachers.save(new Teacher(
                ensureUser("teacher2", "teacher2@scholartrack.local", "Prof. Neha Singh", Role.TEACHER, "teacher123"), "EMP102", cse));

        for (Subject s : new Subject[]{aoa, dbms, os}) assignments.save(new TeacherAssignment(t1, s, a));
        for (Subject s : new Subject[]{cn, se}) {
            assignments.save(new TeacherAssignment(t2, s, a));
            assignments.save(new TeacherAssignment(t2, s, b));
        }

        String[] names = {"Ananya Gupta", "Rohan Mehta", "Priya Sharma", "Karan Singh", "Isha Jain",
                          "Vikram Rathore", "Neha Agarwal", "Aditya Joshi", "Sana Khan", "Manish Yadav"};
        for (int i = 0; i < names.length; i++) {
            String username = i == 0 ? "student" : "student" + (i + 1);
            User u = ensureUser(username, username + "@scholartrack.local", names[i], Role.STUDENT, "student123");
            ClassGroup cg = i < 7 ? a : b;   // students 1-7 in CSE-A, 8-10 in CSE-B
            students.save(new Student(u, String.format("CSE23%02d", i + 1), cse, cg));
        }
        log.info("Seeded academic data: CSE, 5 subjects, 2 classes, 2 teachers, 10 students");
    }

    private User ensureUser(String username, String email, String name, Role role, String password) {
        return users.findByUsernameIgnoreCase(username).orElseGet(() -> {
            User u = new User();
            u.setUsername(username); u.setEmail(email); u.setFullName(name); u.setRole(role);
            u.setPasswordHash(encoder.encode(password));
            return users.save(u);
        });
    }
}
