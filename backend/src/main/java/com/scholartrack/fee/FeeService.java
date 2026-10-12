package com.scholartrack.fee;

import com.scholartrack.academic.AcademicDtos.PageDto;
import com.scholartrack.academic.Student;
import com.scholartrack.academic.StudentRepository;
import com.scholartrack.common.ApiException;
import com.scholartrack.fee.FeeDtos.*;
import com.scholartrack.live.LiveEvent;
import com.scholartrack.live.LiveEventPublisher;
import com.scholartrack.user.User;
import com.scholartrack.user.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FeeService {
    private final FeeRepository fees;
    private final PaymentRepository payments;
    private final StudentRepository students;
    private final UserRepository users;
    private final LiveEventPublisher live;

    public FeeService(FeeRepository fees, PaymentRepository payments, StudentRepository students,
                      UserRepository users, LiveEventPublisher live) {
        this.fees = fees; this.payments = payments; this.students = students; this.users = users; this.live = live;
    }

    // ---------------- HOD ----------------
    @Transactional
    public Map<String, Integer> createFees(CreateFeeRequest r) {
        if ((r.studentId() == null) == (r.classId() == null)) throw bad("Provide exactly one of studentId or classId");
        List<Student> targets = r.studentId() != null
                ? List.of(students.findById(r.studentId()).orElseThrow(() -> notFound("Student not found")))
                : students.findByClassGroupIdOrderByRollNo(r.classId());
        if (targets.isEmpty()) throw bad("No students found for this target");
        for (Student s : targets)
            fees.save(new Fee(s, r.title().trim(), r.amount().setScale(2, RoundingMode.HALF_UP),
                    r.lateFee().setScale(2, RoundingMode.HALF_UP), r.dueDate()));
        live.toUsers(targets.stream().map(s -> s.getUser().getUsername()).toList(),
                LiveEvent.of("FEE_UPDATED", "New fee: " + r.title().trim()));
        return Map.of("created", targets.size());
    }

    @Transactional
    public FeeDto recordPayment(String hodUsername, Long feeId, RecordPaymentRequest r) {
        Fee fee = fees.findById(feeId).orElseThrow(() -> notFound("Fee not found"));
        List<Payment> existing = payments.findByFeeIdOrderByPaidAtAsc(feeId);
        FeeCalc.Summary sm = summary(fee, existing);
        if (sm.outstanding().signum() == 0) throw new ApiException(HttpStatus.CONFLICT, "This fee is already fully paid");
        BigDecimal amount = r.amount().setScale(2, RoundingMode.HALF_UP);
        if (amount.compareTo(sm.outstanding()) > 0)
            throw bad("Payment exceeds the outstanding amount of " + sm.outstanding().toPlainString());
        User by = users.findByUsernameIgnoreCase(hodUsername)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required"));
        String ref = (r.reference() == null || r.reference().isBlank()) ? null : r.reference().trim();
        Payment p = payments.save(new Payment(fee, amount, LocalDateTime.now(), r.method(), ref, by));
        fee.touch();
        fees.save(fee);
        List<Payment> all = new ArrayList<>(existing);
        all.add(p);
        live.toUser(fee.getStudent().getUser().getUsername(),
                LiveEvent.of("FEE_UPDATED", "Payment of Rs. " + amount.toPlainString() + " received for " + fee.getTitle()));
        live.toHods(LiveEvent.of("FEE_UPDATED", "Payment recorded for " + fee.getStudent().getRollNo()));
        return toDto(fee, all);
    }

    @Transactional(readOnly = true)
    public PageDto<FeeDto> listFees(String status, String q, int page, int size) {
        List<FeeDto> all = allDtos();
        String needle = q == null ? "" : q.trim().toLowerCase();
        List<FeeDto> filtered = all.stream()
                .filter(f -> status == null || status.isBlank() || f.status().equalsIgnoreCase(status))
                .filter(f -> needle.isEmpty() || f.rollNo().toLowerCase().contains(needle) || f.studentName().toLowerCase().contains(needle))
                .toList();
        int safeSize = Math.max(1, Math.min(size, 100));
        int safePage = Math.max(page, 0);
        int from = Math.min(safePage * safeSize, filtered.size());
        int to = Math.min(from + safeSize, filtered.size());
        int pages = (int) Math.ceil(filtered.size() / (double) safeSize);
        return new PageDto<>(filtered.subList(from, to), safePage, safeSize, filtered.size(), pages);
    }

    @Transactional(readOnly = true)
    public FeeSummaryDto summaryForHod() {
        List<FeeDto> all = allDtos();
        BigDecimal billed = BigDecimal.ZERO, paid = BigDecimal.ZERO, out = BigDecimal.ZERO;
        long fully = 0, overdue = 0;
        for (FeeDto f : all) {
            billed = billed.add(f.totalAmount()).add(f.lateFeeApplied());
            paid = paid.add(f.paid());
            out = out.add(f.outstanding());
            if (f.status().equals("PAID")) fully++;
            if (f.status().equals("OVERDUE")) overdue++;
        }
        return new FeeSummaryDto(billed, paid, out, all.size(), fully, overdue);
    }

    // ---------------- Student ----------------
    @Transactional(readOnly = true)
    public MyFeesDto myFees(String username) {
        User u = users.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required"));
        Student s = students.findByUserId(u.getId()).orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "Student profile required"));
        List<Fee> list = fees.findByStudentIdOrderByDueDateAsc(s.getId());
        Map<Long, List<Payment>> byFee = paymentsByFee(list);
        List<FeeDto> dtos = list.stream().map(f -> toDto(f, byFee.getOrDefault(f.getId(), List.of()))).toList();
        BigDecimal billed = BigDecimal.ZERO, paid = BigDecimal.ZERO, out = BigDecimal.ZERO;
        for (FeeDto f : dtos) {
            billed = billed.add(f.totalAmount()).add(f.lateFeeApplied());
            paid = paid.add(f.paid());
            out = out.add(f.outstanding());
        }
        return new MyFeesDto(billed, paid, out, dtos);
    }

    @Transactional(readOnly = true)
    public MyFeesDto feesOf(Long studentId) {
        List<Fee> list = fees.findByStudentIdOrderByDueDateAsc(studentId);
        Map<Long, List<Payment>> byFee = paymentsByFee(list);
        List<FeeDto> dtos = list.stream().map(f -> toDto(f, byFee.getOrDefault(f.getId(), List.of()))).toList();
        BigDecimal billed = BigDecimal.ZERO, paid = BigDecimal.ZERO, out = BigDecimal.ZERO;
        for (FeeDto f : dtos) {
            billed = billed.add(f.totalAmount()).add(f.lateFeeApplied());
            paid = paid.add(f.paid());
            out = out.add(f.outstanding());
        }
        return new MyFeesDto(billed, paid, out, dtos);
    }

    @Transactional(readOnly = true)
    public List<FeeDto> allFees() { return allDtos(); }

    // ---------------- helpers ----------------
    private List<FeeDto> allDtos() {
        List<Fee> list = fees.findAllByOrderByDueDateAsc();
        Map<Long, List<Payment>> byFee = paymentsByFee(list);
        return list.stream().map(f -> toDto(f, byFee.getOrDefault(f.getId(), List.of()))).toList();
    }

    private Map<Long, List<Payment>> paymentsByFee(List<Fee> list) {
        if (list.isEmpty()) return Map.of();
        return payments.findByFeeIdInOrderByPaidAtAsc(list.stream().map(Fee::getId).toList()).stream()
                .collect(Collectors.groupingBy(p -> p.getFee().getId()));
    }

    private static FeeCalc.Summary summary(Fee f, List<Payment> ps) {
        BigDecimal paid = ps.stream().map(Payment::getAmount).reduce(BigDecimal.ZERO.setScale(2), BigDecimal::add);
        return FeeCalc.summarize(f.getTotalAmount(), f.getLateFee(), f.getDueDate(), paid, LocalDate.now());
    }

    private static FeeDto toDto(Fee f, List<Payment> ps) {
        FeeCalc.Summary s = summary(f, ps);
        Student st = f.getStudent();
        return new FeeDto(f.getId(), st.getId(), st.getRollNo(), st.getUser().getFullName(), f.getTitle(), f.getTotalAmount(),
                s.lateFeeApplied(), s.paid(), s.outstanding(), s.status().name(), f.getDueDate(),
                ps.stream().map(p -> new PaymentDto(p.getId(), p.getAmount(), p.getPaidAt(), p.getMethod().name(), p.getPaymentRef())).toList());
    }

    private static ApiException bad(String m) { return new ApiException(HttpStatus.BAD_REQUEST, m); }
    private static ApiException notFound(String m) { return new ApiException(HttpStatus.NOT_FOUND, m); }
}
