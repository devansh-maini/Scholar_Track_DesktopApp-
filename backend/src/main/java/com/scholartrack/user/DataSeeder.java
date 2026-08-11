package com.scholartrack.user;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/** Creates demo accounts on an empty database. Disable with SEED_DEMO=false in production. */
@Component
@org.springframework.core.annotation.Order(1)
public class DataSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final boolean enabled;

    public DataSeeder(UserRepository users, PasswordEncoder encoder, @Value("${scholartrack.seed-demo}") boolean enabled) {
        this.users = users; this.encoder = encoder; this.enabled = enabled;
    }

    @Override
    public void run(String... args) {
        if (!enabled || users.count() > 0) return;
        create("hod", "hod@scholartrack.local", "Dr. Meera Sharma", Role.HOD, "hod123");
        create("teacher", "teacher@scholartrack.local", "Prof. Rahul Verma", Role.TEACHER, "teacher123");
        create("student", "student@scholartrack.local", "Ananya Gupta", Role.STUDENT, "student123");
        log.info("Seeded demo accounts: hod / teacher / student");
    }

    private void create(String username, String email, String name, Role role, String password) {
        User u = new User();
        u.setUsername(username); u.setEmail(email); u.setFullName(name); u.setRole(role);
        u.setPasswordHash(encoder.encode(password));
        users.save(u);
    }
}
