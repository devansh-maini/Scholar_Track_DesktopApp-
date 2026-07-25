package com.scholartrack.hod;

import com.scholartrack.academic.*;
import com.scholartrack.activity.*;
import com.scholartrack.common.ApiException;
import com.scholartrack.hod.HodDtos.*;
import com.scholartrack.user.User;
import com.scholartrack.user.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * HOD-level analytics: department overview, teacher allocations, and at-risk identification.
 */
@Service
public class HodService {

    private final DepartmentRepository departments;
    private final SubjectRepository subjects;
    private final ClassGroupRepository classGroups;
    private final TeacherAssignmentRepository assignments;
    private final TeacherRepository teachers;
    private final StudentRepository students;
    private final AttendanceRepository attendance;
    private final MarkRepository marks;
    private final UserRepository users;

    public HodService(DepartmentRepository departments, SubjectRepository subjects,
                      ClassGroupRepository classGroups, TeacherAssignmentRepository assignments,
                      TeacherRepository teachers, StudentRepository students,
                      AttendanceRepository attendance, MarkRepository marks,
                      UserRepository users) {
        this.departments = departments; this.subjects = subjects;
        this.classGroups = classGroups; this.assignments = assignments;
        this.teachers = teachers; this.students = students;
        this.attendance = attendance; this.marks = marks;
        this.users = users;
    }

    // ─── Department overview ──────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public DepartmentOverviewDto overview(String username) {
        User hod = user(username);
        List<Department> depts = departments.findAll();

        // Pre-fetch all data in bulk to avoid N+1 queries
        List<Student> allStudents = students.findAllByOrderByRollNo();
        List<Teacher> allTeachers = teachers.findAll();
        List<Object[]> attTotals = attendance.totalsByStudent();
        List<Object[]> markTotals = marks.totalsByStudentSubject();

        // Build per-student attendance map
        Map<Long, double[]> attMap = new HashMap<>(); // sid -> [attended, total]
        for (Object[] row : attTotals) {
            Long sid = (Long) row[0];
            long total = (Long) row[1];
            long present = ((Number) row[2]).longValue();
            attMap.put(sid, new double[]{present, total});
        }

        // Build per-student mark percentage map
        Map<Long, List<double[]>> markMap = new HashMap<>(); // sid -> list of [earned, max]
        for (Object[] row : markTotals) {
            Long sid = (Long) row[0];
            BigDecimal earned = (BigDecimal) row[2];
            BigDecimal maxM = (BigDecimal) row[3];
            markMap.computeIfAbsent(sid, k -> new ArrayList<>())
                   .add(new double[]{earned.doubleValue(), maxM.doubleValue()});
        }

        List<DepartmentStatsDto> stats = depts.stream().map(d -> {
            List<Student> ds = allStudents.stream()
                    .filter(s -> s.getDepartment().getId().equals(d.getId())).toList();
            List<Teacher> dt = allTeachers.stream()
                    .filter(t -> t.getDepartment().getId().equals(d.getId())).toList();
            return deptStats(d, ds, dt, attMap, markMap);
        }).toList();

        long totalStudents = stats.stream().mapToLong(DepartmentStatsDto::totalStudents).sum();
        long totalTeachers = stats.stream().mapToLong(DepartmentStatsDto::totalTeachers).sum();
        long atRisk = stats.stream().mapToLong(DepartmentStatsDto::atRiskStudents).sum();
        double avgAtt = stats.isEmpty() ? 0 : stats.stream().mapToDouble(DepartmentStatsDto::avgAttendance).average().orElse(0);
        double avgMark = stats.isEmpty() ? 0 : stats.stream().mapToDouble(DepartmentStatsDto::avgMarks).average().orElse(0);
        return new DepartmentOverviewDto(hod.getFullName(), (int) totalStudents,
                (int) totalTeachers, (int) atRisk, round2(avgAtt), round2(avgMark), stats);
    }

    private DepartmentStatsDto deptStats(Department d, List<Student> dStudents, List<Teacher> dTeachers,
                                          Map<Long, double[]> attMap, Map<Long, List<double[]>> markMap) {
        int total = dStudents.size();
        double avgAtt = 0, avgMark = 0;
        int atRisk = 0;
        if (total > 0) {
            double sumAtt = 0;
            double sumMark = 0;
            int countAtt = 0, countMark = 0;
            for (Student s : dStudents) {
                Long sid = s.getId();
                double[] av = attMap.get(sid);
                if (av != null && av[1] > 0) {
                    double pct = 100.0 * av[0] / av[1];
                    sumAtt += pct;
                    countAtt++;
                    if (av[1] > 5 && pct < 75) atRisk++;
                }
                List<double[]> mv = markMap.get(sid);
                if (mv != null && !mv.isEmpty()) {
                    double mpct = mv.stream()
                            .mapToDouble(m -> m[1] == 0 ? 0 : (m[0] / m[1]) * 100)
                            .average().orElse(0);
                    sumMark += mpct;
                    countMark++;
                }
            }
            avgAtt = countAtt == 0 ? 0 : sumAtt / countAtt;
            avgMark = countMark == 0 ? 0 : sumMark / countMark;
        }
        return new DepartmentStatsDto(d.getId(), d.getCode(), d.getName(),
                total, dTeachers.size(), atRisk, round2(avgAtt), round2(avgMark));
    }

    // ─── Teacher allocations ──────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TeacherAllocationDto> teacherAllocations() {
        List<Teacher> tList = teachers.findAll();
        return tList.stream().map(t -> {
            List<TeacherAssignment> tas = assignments.findByTeacherId(t.getId());
            List<SubjectClassDto> allocated = tas.stream()
                    .map(ta -> new SubjectClassDto(ta.getSubject().getId(), ta.getSubject().getCode(),
                            ta.getSubject().getName(), ta.getClassGroup().getId(), ta.getClassGroup().getName()))
                    .toList();
            return new TeacherAllocationDto(t.getId(), t.getUser().getFullName(),
                    t.getUser().getEmail(), t.getEmployeeCode(), t.getDepartment().getName(), allocated);
        }).toList();
    }

    // ─── At-risk students ────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AtRiskStudentDto> atRiskStudents(String departmentCode) {
        List<Student> allSt = students.findAllByOrderByRollNo();
        if (departmentCode != null && !departmentCode.isBlank()) {
            String dc = departmentCode.trim().toUpperCase();
            allSt = allSt.stream().filter(s -> dc.equals(s.getDepartment().getCode())).toList();
        }

        List<Object[]> attTotals = attendance.totalsByStudent();
        List<Object[]> markTotals = marks.totalsByStudentSubject();

        Map<Long, double[]> attMap = new HashMap<>();
        for (Object[] row : attTotals) {
            Long sid = (Long) row[0];
            long total = (Long) row[1];
            long present = ((Number) row[2]).longValue();
            attMap.put(sid, new double[]{present, total});
        }
        Map<Long, Double> avgMarkPctMap = new HashMap<>();
        Map<Long, List<double[]>> marksByStudent = new HashMap<>();
        for (Object[] row : markTotals) {
            Long sid = (Long) row[0];
            BigDecimal earned = (BigDecimal) row[2];
            BigDecimal maxM = (BigDecimal) row[3];
            marksByStudent.computeIfAbsent(sid, k -> new ArrayList<>())
                    .add(new double[]{earned.doubleValue(), maxM.doubleValue()});
        }
        for (var e : marksByStudent.entrySet()) {
            double pct = e.getValue().stream()
                    .mapToDouble(m -> m[1] == 0 ? 0 : (m[0] / m[1]) * 100)
                    .average().orElse(100);
            avgMarkPctMap.put(e.getKey(), pct);
        }

        List<AtRiskStudentDto> result = new ArrayList<>();
        for (Student s : allSt) {
            Long sid = s.getId();
            double[] av = attMap.get(sid);
            double attPct = (av != null && av[1] > 0) ? 100.0 * av[0] / av[1] : 100.0;
            double avgMark = avgMarkPctMap.getOrDefault(sid, 100.0);
            boolean hasAttData = av != null && av[1] > 5;

            List<String> reasons = new ArrayList<>();
            if (hasAttData && attPct < 75)
                reasons.add(String.format("Attendance %.1f%% — below 75%% requirement", attPct));
            if (avgMarkPctMap.containsKey(sid) && avgMark < 40)
                reasons.add(String.format("Average marks %.1f%% — below 40%% passing threshold", avgMark));

            if (!reasons.isEmpty()) {
                String level = reasons.size() >= 2 ? "HIGH" : "MEDIUM";
                result.add(new AtRiskStudentDto(sid, s.getUser().getFullName(),
                        s.getRollNo(), s.getDepartment().getName(), s.getClassGroup().getName(),
                        round2(attPct), round2(avgMark), level, reasons));
            }
        }
        result.sort(Comparator.comparing(AtRiskStudentDto::riskLevel).reversed());
        return result;
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private User user(String username) {
        return users.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required"));
    }

    private static double round2(double v) { return Math.round(v * 100.0) / 100.0; }
}
