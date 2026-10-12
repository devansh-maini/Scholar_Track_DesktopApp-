package com.scholartrack.notice;

import com.scholartrack.academic.ClassGroup;
import com.scholartrack.academic.ClassGroupRepository;
import com.scholartrack.user.User;
import com.scholartrack.user.UserRepository;
import java.time.LocalDate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(5)
public class NoticeSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(NoticeSeeder.class);
    private final NoticeRepository notices;
    private final UserRepository users;
    private final ClassGroupRepository classes;
    private final boolean enabled;

    public NoticeSeeder(NoticeRepository notices, UserRepository users, ClassGroupRepository classes,
                        @Value("${scholartrack.seed-demo}") boolean enabled) {
        this.notices = notices; this.users = users; this.classes = classes; this.enabled = enabled;
    }

    @Override
    public void run(String... args) {
        if (!enabled || notices.count() > 0) return;
        User hod = users.findByUsernameIgnoreCase("hod").orElse(null);
        User t1 = users.findByUsernameIgnoreCase("teacher").orElse(null);
        User t2 = users.findByUsernameIgnoreCase("teacher2").orElse(null);
        Long classA = classes.findAll().stream().filter(c -> c.getName().equals("CSE-A")).map(ClassGroup::getId).findFirst().orElse(null);
        Long classB = classes.findAll().stream().filter(c -> c.getName().equals("CSE-B")).map(ClassGroup::getId).findFirst().orElse(null);
        if (hod == null || t1 == null || t2 == null || classA == null || classB == null) return;
        LocalDate today = LocalDate.now();

        notices.save(new Notice(hod, "Mid-Semester Exam Schedule", "Mid-semester examinations begin in two weeks. Check the timetable on the notice board.",
                today.plusDays(30), NoticePriority.IMPORTANT, NoticeTarget.ALL, null));
        notices.save(new Notice(hod, "Fee Payment Reminder", "Semester 5 tuition fee must be cleared before the due date to avoid the late fee.",
                today.plusDays(14), NoticePriority.URGENT, NoticeTarget.STUDENTS, null));
        notices.save(new Notice(hod, "Faculty Meeting", "Department faculty meeting this Friday at 3 PM in the seminar hall.",
                today.plusDays(7), NoticePriority.NORMAL, NoticeTarget.TEACHERS, null));
        notices.save(new Notice(t1, "AOA Tutorial Rescheduled", "The Analysis of Algorithms tutorial for CSE-A moves to Thursday 2 PM.",
                today.plusDays(10), NoticePriority.NORMAL, NoticeTarget.CLASS, classA));
        notices.save(new Notice(t2, "CSE-B Lab Batch Change", "CSE-B lab batches have been reshuffled. See the revised list outside the lab.",
                today.plusDays(10), NoticePriority.IMPORTANT, NoticeTarget.CLASS, classB));
        notices.save(new Notice(hod, "Old Orientation Notice", "This notice has expired and should only be visible to the HOD when expired notices are requested.",
                today.minusDays(1), NoticePriority.NORMAL, NoticeTarget.ALL, null));
        log.info("Seeded notices");
    }
}
