package com.scholartrack.hod;

import com.scholartrack.common.ApiResponse;
import com.scholartrack.hod.HodDtos.*;
import com.scholartrack.syllabus.SyllabusService;
import java.security.Principal;
import java.util.List;
import org.springframework.web.bind.annotation.*;

/**
 * HOD REST endpoints.
 * All routes under /api/v1/hod/** are protected at the security layer
 * (SecurityConfig.hasRole("HOD")).
 */
@RestController
@RequestMapping("/api/v1/hod")
public class HodController {

    private final HodService svc;
    private final SyllabusService syllabusSvc;

    public HodController(HodService svc, SyllabusService syllabusSvc) {
        this.svc = svc; this.syllabusSvc = syllabusSvc;
    }

    /** Full department overview with performance metrics for all departments. */
    @GetMapping("/overview")
    public ApiResponse<DepartmentOverviewDto> overview(Principal p) {
        return ApiResponse.ok("Department overview", svc.overview(p.getName()));
    }

    /** List all teacher–subject–class allocations across departments. */
    @GetMapping("/teacher-allocations")
    public ApiResponse<List<TeacherAllocationDto>> teacherAllocations() {
        return ApiResponse.ok("Teacher allocations", svc.teacherAllocations());
    }

    /** Syllabus completion audit across every subject and class group. */
    @GetMapping("/syllabus-audit")
    public ApiResponse<Object> syllabusAudit() {
        // Reuse the existing SyllabusService.overview() which returns the complete breakdown
        return ApiResponse.ok("Syllabus audit", syllabusSvc.overview());
    }

    /** At-risk students filtered by optional department code. */
    @GetMapping("/at-risk")
    public ApiResponse<List<AtRiskStudentDto>> atRisk(
            @RequestParam(required = false) String departmentCode) {
        return ApiResponse.ok("At-risk students", svc.atRiskStudents(departmentCode));
    }
}
