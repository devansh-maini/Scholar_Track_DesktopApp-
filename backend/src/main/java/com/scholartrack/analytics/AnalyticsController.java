package com.scholartrack.analytics;

import com.scholartrack.academic.AcademicDtos.PageDto;
import com.scholartrack.analytics.AnalyticsDtos.*;
import com.scholartrack.common.ApiResponse;
import java.security.Principal;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class AnalyticsController {
    private final AnalyticsService svc;
    public AnalyticsController(AnalyticsService svc) { this.svc = svc; }

    // ---- HOD (route group /api/v1/hod/** is HOD-only) ----
    @GetMapping("/hod/analytics/dashboard")
    public ApiResponse<DashboardDto> dashboard() { return ApiResponse.ok("HOD dashboard", svc.dashboard()); }

    @GetMapping("/hod/analytics/semesters")
    public ApiResponse<List<SemesterStatDto>> semesters() { return ApiResponse.ok("Semester analytics", svc.semesters()); }

    @GetMapping("/hod/analytics/classes")
    public ApiResponse<List<ClassStatDto>> classes() { return ApiResponse.ok("Class analytics", svc.classes()); }

    @GetMapping("/hod/analytics/subjects")
    public ApiResponse<List<SubjectStatDto>> subjects() { return ApiResponse.ok("Subject analytics (weakest first)", svc.subjects()); }

    @GetMapping("/hod/analytics/attendance-trend")
    public ApiResponse<List<AttendancePointDto>> trend() { return ApiResponse.ok("Attendance trend", svc.attendanceTrend()); }

    @GetMapping("/hod/analytics/risk")
    public ApiResponse<PageDto<StudentRowDto>> risk(@RequestParam(required = false) String level,
                                                    @RequestParam(defaultValue = "0") int page,
                                                    @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok("Risk analysis", svc.riskPage(level, page, size));
    }

    @GetMapping("/hod/analytics/risk/{studentId}")
    public ApiResponse<RiskDetailDto> riskDetail(@PathVariable Long studentId) { return ApiResponse.ok("Risk detail", svc.riskDetail(studentId)); }

    @GetMapping("/hod/analytics/compare")
    public ApiResponse<List<StudentRowDto>> compare(@RequestParam List<Long> studentIds) { return ApiResponse.ok("Comparison", svc.compare(studentIds)); }

    @GetMapping("/hod/analytics/low-attendance")
    public ApiResponse<List<StudentRowDto>> lowAttendance() { return ApiResponse.ok("Students below 75% attendance", svc.lowAttendance()); }

    // ---- Student: own indicator ----
    @GetMapping("/students/me/risk") @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<RiskDetailDto> myRisk(Principal p) { return ApiResponse.ok("My academic risk indicator", svc.myRisk(p.getName())); }

    // ---- Teacher: assigned classes only ----
    @GetMapping("/teachers/me/classes/{classId}/performance") @PreAuthorize("hasAnyRole('TEACHER','HOD')")
    public ApiResponse<List<StudentRowDto>> classPerformance(@PathVariable Long classId, Principal p) {
        return ApiResponse.ok("Class performance", svc.classPerformance(p.getName(), classId));
    }
}
