package com.scholartrack.syllabus;

import com.scholartrack.academic.Subject;
import com.scholartrack.academic.SubjectRepository;
import com.scholartrack.academic.TeacherAssignment;
import com.scholartrack.academic.TeacherAssignmentRepository;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

/** 6 topics (3 units) per subject; each class has completed between 2 and 5 of them. */
@Component
@Order(7)
public class SyllabusSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(SyllabusSeeder.class);
    private final SyllabusTopicRepository topics;
    private final SyllabusProgressRepository progress;
    private final SubjectRepository subjects;
    private final TeacherAssignmentRepository assignments;
    private final PlatformTransactionManager tm;
    private final boolean enabled;

    public SyllabusSeeder(SyllabusTopicRepository topics, SyllabusProgressRepository progress, SubjectRepository subjects,
                          TeacherAssignmentRepository assignments, PlatformTransactionManager tm,
                          @Value("${scholartrack.seed-demo}") boolean enabled) {
        this.topics = topics; this.progress = progress; this.subjects = subjects; this.assignments = assignments;
        this.tm = tm; this.enabled = enabled;
    }

    @Override
    public void run(String... args) {
        if (!enabled || topics.count() > 0 || subjects.count() == 0) return;
        new TransactionTemplate(tm).executeWithoutResult(st -> seed());
        log.info("Seeded syllabus topics and progress");
    }

    private void seed() {
        for (Subject s : subjects.findAll())
            for (int k = 1; k <= 6; k++) {
                int unit = (k + 1) / 2;
                topics.save(new SyllabusTopic(s, unit, "Unit " + unit + ": " + s.getName() + " - Topic " + k, k));
            }
        for (TeacherAssignment ta : assignments.findAll()) {
            List<SyllabusTopic> list = topics.findBySubjectIdOrderBySortOrder(ta.getSubject().getId());
            int n = (int) ((ta.getSubject().getId() + ta.getClassGroup().getId()) % 4) + 2;   // 2..5 topics done
            for (SyllabusTopic t : list) {
                SyllabusProgress p = new SyllabusProgress(t, ta.getClassGroup());
                p.mark(t.getSortOrder() <= n, ta.getTeacher());
                progress.save(p);
            }
        }
    }
}
