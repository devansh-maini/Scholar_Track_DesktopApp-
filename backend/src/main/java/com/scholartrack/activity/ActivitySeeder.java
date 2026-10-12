package com.scholartrack.activity;

import com.scholartrack.academic.*;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * Demo activity data (deterministic): 20 class days of attendance, midterm + internal marks, two assignments per
 * subject, and 4 previous semester SGPAs. Student 6 (Vikram) is deliberately weak/low-attendance for the risk demo.
 */
@Component
@Order(3)
public class ActivitySeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(ActivitySeeder.class);
    private static final double[] ABILITY = {0.88, 0.75, 0.82, 0.70, 0.90, 0.42, 0.78, 0.60, 0.85, 0.55};
    private static final double[] ATTEND  = {0.93, 0.86, 0.80, 0.88, 0.96, 0.60, 0.82, 0.72, 0.91, 0.68};

    private final AttendanceRepository attendance;
    private final MarkRepository marks;
    private final CourseworkRepository coursework;
    private final SubmissionRepository submissions;
    private final SemesterResultRepository semesterResults;
    private final StudentRepository students;
    private final TeacherAssignmentRepository assignments;
    private final PlatformTransactionManager tm;
    private final boolean enabled;

    public ActivitySeeder(AttendanceRepository attendance, MarkRepository marks, CourseworkRepository coursework,
                          SubmissionRepository submissions, SemesterResultRepository semesterResults,
                          StudentRepository students, TeacherAssignmentRepository assignments,
                          PlatformTransactionManager tm, @Value("${scholartrack.seed-demo}") boolean enabled) {
        this.attendance = attendance; this.marks = marks; this.coursework = coursework; this.submissions = submissions;
        this.semesterResults = semesterResults; this.students = students; this.assignments = assignments;
        this.tm = tm; this.enabled = enabled;
    }

    @Override
    public void run(String... args) {
        if (!enabled || attendance.count() > 0 || students.count() == 0) return;
        new TransactionTemplate(tm).executeWithoutResult(status -> seed());
        log.info("Seeded activity data: attendance, marks, assignments, submissions, previous semester results");
    }

    private void seed() {
        Random rnd = new Random(42);
        List<Student> all = students.findAll(Sort.by("rollNo"));
        List<LocalDate> days = classDays(20);
        LocalDateTime now = LocalDateTime.now();
        List<AttendanceRecord> att = new ArrayList<>();
        List<Mark> mk = new ArrayList<>();

        for (TeacherAssignment ta : assignments.findAll()) {
            Long classId = ta.getClassGroup().getId();
            List<Student> cls = all.stream().filter(s -> s.getClassGroup().getId().equals(classId)).toList();

            for (Student s : cls) {
                int i = all.indexOf(s);
                double prob = i < ATTEND.length ? ATTEND[i] : 0.80;
                double ability = i < ABILITY.length ? ABILITY[i] : 0.70;
                for (LocalDate d : days)
                    att.add(new AttendanceRecord(s, ta.getSubject(), d,
                            rnd.nextDouble() < prob ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT, ta.getTeacher()));
                mk.add(score(s, ta, AssessmentType.MIDTERM, 30, ability, rnd));
                mk.add(score(s, ta, AssessmentType.INTERNAL, 20, ability, rnd));
            }

            // Assignment 1: past deadline, mostly submitted, ~70% evaluated. Assignment 2: open, nothing submitted yet.
            Coursework a1 = coursework.save(new Coursework(ta.getSubject(), ta.getClassGroup(), ta.getTeacher(),
                    "Assignment 1", "Problem set 1 for " + ta.getSubject().getName(), now.minusDays(7), BigDecimal.valueOf(10)));
            coursework.save(new Coursework(ta.getSubject(), ta.getClassGroup(), ta.getTeacher(),
                    "Assignment 2", "Problem set 2 for " + ta.getSubject().getName(), now.plusDays(7), BigDecimal.valueOf(10)));
            for (Student s : cls) {
                int i = all.indexOf(s);
                double ability = i < ABILITY.length ? ABILITY[i] : 0.70;
                if (rnd.nextDouble() > 0.85) continue;
                Submission sub = new Submission(a1, s);
                boolean late = rnd.nextDouble() < 0.10;
                sub.submit("https://example.edu/submissions/" + s.getRollNo() + "-" + ta.getSubject().getCode() + "-1",
                        late ? now.minusDays(6) : now.minusDays(9), late ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED);
                if (rnd.nextDouble() < 0.70)
                    sub.evaluate(half(10 * clamp(ability + (rnd.nextDouble() - 0.5) * 0.2, 0.2, 1.0)), "Reviewed", now.minusDays(2));
                submissions.save(sub);
            }
        }
        attendance.saveAll(att);
        marks.saveAll(mk);

        for (Student s : all) {
            int i = all.indexOf(s);
            double ability = i < ABILITY.length ? ABILITY[i] : 0.70;
            for (int sem = 1; sem < s.getClassGroup().getSemesterNo(); sem++) {
                double v = clamp(ability * 10 * 0.95 + (rnd.nextDouble() - 0.5), 4.5, 9.8);
                semesterResults.save(new SemesterResult(s, sem, BigDecimal.valueOf(Math.round(v * 100) / 100.0), 22));
            }
        }
    }

    private Mark score(Student s, TeacherAssignment ta, AssessmentType type, int max, double ability, Random rnd) {
        Mark m = new Mark(s, ta.getSubject(), type);
        m.setScore(half(max * clamp(ability + (rnd.nextDouble() - 0.5) * 0.16, 0.15, 1.0)), BigDecimal.valueOf(max), ta.getTeacher());
        return m;
    }

    private static BigDecimal half(double v) { return BigDecimal.valueOf(Math.round(v * 2) / 2.0); }
    private static double clamp(double v, double lo, double hi) { return Math.max(lo, Math.min(hi, v)); }

    private static List<LocalDate> classDays(int n) {
        List<LocalDate> days = new ArrayList<>();
        LocalDate d = LocalDate.now().minusDays(1);
        while (days.size() < n) {
            if (d.getDayOfWeek() != DayOfWeek.SATURDAY && d.getDayOfWeek() != DayOfWeek.SUNDAY) days.add(d);
            d = d.minusDays(1);
        }
        return days;
    }
}
