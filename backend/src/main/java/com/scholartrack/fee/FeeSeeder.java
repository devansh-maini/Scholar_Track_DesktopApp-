package com.scholartrack.fee;

import com.scholartrack.academic.Student;
import com.scholartrack.academic.StudentRepository;
import com.scholartrack.user.User;
import com.scholartrack.user.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

/** Demo fees. Student index i: i%4==0 paid, 1 partially paid, 2 pending, 3 overdue (with late fee). Everyone has an unpaid exam fee. */
@Component
@Order(4)
public class FeeSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(FeeSeeder.class);
    private final FeeRepository fees;
    private final PaymentRepository payments;
    private final StudentRepository students;
    private final UserRepository users;
    private final boolean enabled;

    public FeeSeeder(FeeRepository fees, PaymentRepository payments, StudentRepository students, UserRepository users,
                     @Value("${scholartrack.seed-demo}") boolean enabled) {
        this.fees = fees; this.payments = payments; this.students = students; this.users = users; this.enabled = enabled;
    }

    @Override
    public void run(String... args) {
        if (!enabled || fees.count() > 0 || students.count() == 0) return;
        User hod = users.findByUsernameIgnoreCase("hod").orElse(null);
        if (hod == null) return;
        LocalDate today = LocalDate.now();
        List<Student> all = students.findAll(Sort.by("rollNo"));
        for (int i = 0; i < all.size(); i++) {
            Student s = all.get(i);
            int mode = i % 4;
            LocalDate due = switch (mode) { case 0 -> today.minusDays(20); case 1 -> today.plusDays(15); case 2 -> today.plusDays(20); default -> today.minusDays(5); };
            Fee tuition = fees.save(new Fee(s, "Semester 5 Tuition Fee", new BigDecimal("85000.00"), new BigDecimal("1500.00"), due));
            if (mode == 0)
                payments.save(new Payment(tuition, new BigDecimal("85000.00"), LocalDateTime.now().minusDays(25), PaymentMethod.BANK_TRANSFER, "TXN-" + (1000 + i), hod));
            if (mode == 1)
                payments.save(new Payment(tuition, new BigDecimal("40000.00"), LocalDateTime.now().minusDays(3), PaymentMethod.UPI, "UPI-" + (2000 + i), hod));
            fees.save(new Fee(s, "Examination Fee", new BigDecimal("2500.00"), new BigDecimal("200.00"), today.plusDays(30)));
        }
        log.info("Seeded fees and payments for {} students", all.size());
    }
}
