package com.scholartrack.complaint;

import com.scholartrack.user.User;
import com.scholartrack.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(6)
public class ComplaintSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(ComplaintSeeder.class);
    private final ComplaintRepository complaints;
    private final UserRepository users;
    private final boolean enabled;

    public ComplaintSeeder(ComplaintRepository complaints, UserRepository users, @Value("${scholartrack.seed-demo}") boolean enabled) {
        this.complaints = complaints; this.users = users; this.enabled = enabled;
    }

    @Override
    public void run(String... args) {
        if (!enabled || complaints.count() > 0) return;
        User hod = users.findByUsernameIgnoreCase("hod").orElse(null);
        User teacher = users.findByUsernameIgnoreCase("teacher").orElse(null);
        User s1 = users.findByUsernameIgnoreCase("student").orElse(null);
        User s3 = users.findByUsernameIgnoreCase("student3").orElse(null);
        User s6 = users.findByUsernameIgnoreCase("student6").orElse(null);
        if (hod == null || teacher == null || s1 == null || s3 == null || s6 == null) return;

        complaints.save(new Complaint(s1, ComplaintCategory.ACADEMIC, "Unclear marking scheme in DBMS",
                "The internal marking scheme for DBMS was not shared before the midterm. Please clarify."));

        Complaint c2 = new Complaint(s6, ComplaintCategory.ATTENDANCE, "Attendance not updated",
                "My attendance for last Tuesday's OS lecture was not recorded although I attended.");
        c2.seedState(ComplaintStatus.IN_PROGRESS, teacher, null);
        complaints.save(c2);

        Complaint c3 = new Complaint(s3, ComplaintCategory.FACILITIES, "Lab computers not working",
                "Five computers in Lab 2 do not boot, which slows down practical sessions.");
        c3.seedState(ComplaintStatus.RESOLVED, hod, "Hardware team replaced the faulty machines.");
        complaints.save(c3);
        log.info("Seeded complaints");
    }
}
