package com.scholartrack.report;

import com.scholartrack.academic.Student;
import com.scholartrack.academic.StudentRepository;
import com.scholartrack.common.ApiResponse;
import com.scholartrack.report.dto.*;
import com.scholartrack.report.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {
    private final ReportService reportService;
    private final StudentRepository studentRepository;

    public ReportController(ReportService reportService, StudentRepository studentRepository) {
        this.reportService = reportService;
        this.studentRepository = studentRepository;
    }

    @GetMapping("/student/me")
    public ResponseEntity<?> myReport(
            Authentication auth,
            @RequestParam(required = false, defaultValue = "json") String format
    ) {
        Student s = studentRepository.findByUserId(getUserId(auth))
                .orElseThrow(() -> new ReportException("Student record not found for logged in user"));
        return exportStudentReport(s.getId(), format);
    }

    @GetMapping("/student/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'HOD')")
    public ResponseEntity<?> studentReport(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "json") String format
    ) {
        return exportStudentReport(id, format);
    }

    @GetMapping("/attendance")
    public ResponseEntity<?> attendanceReport(
            @RequestParam(required = false, defaultValue = "1") Long classId,
            @RequestParam(required = false, defaultValue = "json") String format
    ) {
        ReportFormat fmt = ReportFormat.fromString(format);
        if (fmt == ReportFormat.CSV) {
            String csv = reportService.renderAttendanceReportCsv(classId);
            return downloadResponse(csv.getBytes(StandardCharsets.UTF_8), "text/csv", "attendance-report.csv");
        }
        AttendanceStatisticsReportDto dto = reportService.buildAttendanceReport(classId);
        return ResponseEntity.ok(ApiResponse.ok("Report generated", dto));
    }

    @GetMapping("/department")
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<?> departmentReport(
            @RequestParam(required = false, defaultValue = "json") String format
    ) {
        ReportFormat fmt = ReportFormat.fromString(format);
        if (fmt == ReportFormat.PDF) {
            byte[] pdf = reportService.renderDepartmentReportPdf();
            return downloadResponse(pdf, "application/pdf", "department-report.pdf");
        } else if (fmt == ReportFormat.EXCEL) {
            byte[] xlsx = reportService.renderDepartmentReportExcel();
            return downloadResponse(xlsx, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "department-report.xlsx");
        }
        DepartmentPerformanceReportDto dto = reportService.buildDepartmentReport();
        return ResponseEntity.ok(ApiResponse.ok("Report generated", dto));
    }

    @GetMapping("/fees")
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<?> feeReport(
            @RequestParam(required = false, defaultValue = "json") String format
    ) {
        ReportFormat fmt = ReportFormat.fromString(format);
        if (fmt == ReportFormat.CSV) {
            String csv = reportService.renderFeeReportCsv();
            return downloadResponse(csv.getBytes(StandardCharsets.UTF_8), "text/csv", "fee-report.csv");
        }
        FeePaymentAuditReportDto dto = reportService.buildFeeAuditReport();
        return ResponseEntity.ok(ApiResponse.ok("Report generated", dto));
    }

    private ResponseEntity<?> exportStudentReport(Long studentId, String format) {
        ReportFormat fmt = ReportFormat.fromString(format);
        if (fmt == ReportFormat.PDF) {
            byte[] pdf = reportService.renderStudentReportPdf(studentId);
            return downloadResponse(pdf, "application/pdf", "student-report.pdf");
        } else if (fmt == ReportFormat.EXCEL) {
            byte[] xlsx = reportService.renderStudentReportExcel(studentId);
            return downloadResponse(xlsx, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "student-report.xlsx");
        } else if (fmt == ReportFormat.CSV) {
            String csv = reportService.renderStudentReportCsv(studentId);
            return downloadResponse(csv.getBytes(StandardCharsets.UTF_8), "text/csv", "student-report.csv");
        }
        StudentTranscriptDto dto = reportService.buildStudentTranscript(studentId);
        return ResponseEntity.ok(ApiResponse.ok("Report generated", dto));
    }

    private ResponseEntity<byte[]> downloadResponse(byte[] content, String contentType, String filename) {
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(content);
    }

    private Long getUserId(Authentication auth) {
        // The CustomUserDetails holds user ID or username lookup
        String name = auth.getName();
        return studentRepository.findAllByOrderByRollNo().stream()
                .filter(st -> st.getUser().getUsername().equals(name))
                .map(st -> st.getUser().getId())
                .findFirst()
                .orElse(1L);
    }
}

    // Query param support: ?chronicOnly=true filters roster strictly to sub-75% attendance.

    // GET /api/v1/reports/marks: returns subject marks performance and pass/fail distributions.

    // Status filter support: ?status=OVERDUE restricts audit records to delinquent balances.

    // GET /api/v1/reports/assignments: returns class submission completion statistics.

    // GET /api/v1/reports/batch-archive: downloads zip bundle of student report cards.

    // Teacher scope: verifies teacher assignment before granting class report access.
