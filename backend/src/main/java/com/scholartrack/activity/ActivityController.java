package com.scholartrack.activity;

import com.scholartrack.activity.ActivityDtos.*;
import com.scholartrack.common.ApiResponse;
import jakarta.validation.Valid;
import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class ActivityController {
    private final ActivityService svc;
    public ActivityController(ActivityService svc) { this.svc = svc; }

    // ---------------- Teacher: attendance ----------------
    @GetMapping("/teachers/me/classes/{classId}/subjects/{subjectId}/attendance") @PreAuthorize("hasRole('TEACHER')")
    public ApiResponse<List<AttendanceRowDto>> attendanceSheet(@PathVariable Long classId, @PathVariable Long subjectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date, Principal p) {
        return ApiResponse.ok("Attendance sheet", svc.attendanceSheet(p.getName(), classId, subjectId, date));
    }

    @PutMapping("/teachers/me/attendance") @PreAuthorize("hasRole('TEACHER')")
    public ApiResponse<Map<String, Integer>> markAttendance(@Valid @RequestBody MarkAttendanceRequest r, Principal p) {
        return ApiResponse.ok("Attendance saved", Map.of("saved", svc.markAttendance(p.getName(), r)));
    }

    // ---------------- Teacher: marks ----------------
    @PutMapping("/teachers/me/marks") @PreAuthorize("hasRole('TEACHER')")
    public ApiResponse<Map<String, Integer>> saveMarks(@Valid @RequestBody SaveMarksRequest r, Principal p) {
        return ApiResponse.ok("Marks saved", Map.of("saved", svc.saveMarks(p.getName(), r)));
    }

    @GetMapping("/teachers/me/classes/{classId}/subjects/{subjectId}/marks") @PreAuthorize("hasRole('TEACHER')")
    public ApiResponse<List<MarkDto>> classMarks(@PathVariable Long classId, @PathVariable Long subjectId, Principal p) {
        return ApiResponse.ok("Class marks", svc.classMarks(p.getName(), classId, subjectId));
    }

    // ---------------- Teacher: coursework ----------------
    @PostMapping("/teachers/me/coursework") @PreAuthorize("hasRole('TEACHER')") @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CourseworkDto> createCoursework(@Valid @RequestBody CreateCourseworkRequest r, Principal p) {
        return ApiResponse.ok("Assignment created", svc.createCoursework(p.getName(), r));
    }

    @GetMapping("/teachers/me/coursework") @PreAuthorize("hasRole('TEACHER')")
    public ApiResponse<List<CourseworkDto>> teacherCoursework(Principal p) {
        return ApiResponse.ok("My assignments", svc.teacherCoursework(p.getName()));
    }

    @GetMapping("/teachers/me/coursework/{id}/submissions") @PreAuthorize("hasRole('TEACHER')")
    public ApiResponse<List<SubmissionDto>> submissions(@PathVariable Long id, Principal p) {
        return ApiResponse.ok("Submissions", svc.courseworkSubmissions(p.getName(), id));
    }

    @PutMapping("/teachers/me/coursework/{id}/submissions/{submissionId}/evaluate") @PreAuthorize("hasRole('TEACHER')")
    public ApiResponse<SubmissionDto> evaluate(@PathVariable Long id, @PathVariable Long submissionId,
                                               @Valid @RequestBody EvaluateRequest r, Principal p) {
        return ApiResponse.ok("Submission evaluated", svc.evaluate(p.getName(), id, submissionId, r));
    }

    // ---------------- Student ----------------
    @GetMapping("/students/me/attendance") @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<AttendanceSummaryDto> myAttendance(Principal p) { return ApiResponse.ok("My attendance", svc.myAttendance(p.getName())); }

    @GetMapping("/students/me/marks") @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<List<MarkDto>> myMarks(Principal p) { return ApiResponse.ok("My marks", svc.myMarks(p.getName())); }

    @GetMapping("/students/me/results") @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<ResultDto> myResults(Principal p) { return ApiResponse.ok("My results", svc.myResults(p.getName())); }

    @GetMapping("/students/me/coursework") @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<List<MyCourseworkDto>> myCoursework(Principal p) { return ApiResponse.ok("My assignments", svc.myCoursework(p.getName())); }

    /** Submit student solution / attachment for coursework */
    @PostMapping("/students/me/coursework/{id}/submit") @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<SubmissionDto> submit(@PathVariable Long id, @Valid @RequestBody SubmitRequest r, Principal p) {
        return ApiResponse.ok("Submission saved", svc.submit(p.getName(), id, r));
    }

    // ---------------- HOD ----------------
    @GetMapping("/hod/students/{studentId}/performance")
    public ApiResponse<PerformanceDto> performance(@PathVariable Long studentId) {
        return ApiResponse.ok("Student performance", svc.performance(studentId));
    }
}
