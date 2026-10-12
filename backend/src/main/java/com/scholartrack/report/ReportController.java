package com.scholartrack.report;

import com.scholartrack.common.ApiException;
import java.security.Principal;
import java.time.LocalDate;
import java.util.Locale;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/** Downloads: ?format=pdf (default) | csv | xlsx */
@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {
    private final ReportService svc;
    public ReportController(ReportService svc) { this.svc = svc; }

    @GetMapping("/student/me") @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<byte[]> myReport(@RequestParam(defaultValue = "pdf") String format, Principal p) {
        return respond(svc.myReport(p.getName()), format, "academic-report");
    }

    @GetMapping("/student/{id}") @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<byte[]> studentReport(@PathVariable Long id, @RequestParam(defaultValue = "pdf") String format) {
        return respond(svc.studentReport(id), format, "student-report-" + id);
    }

    @GetMapping("/attendance") @PreAuthorize("hasAnyRole('HOD','TEACHER')")
    public ResponseEntity<byte[]> attendance(@RequestParam(required = false) Long classId, @RequestParam(defaultValue = "pdf") String format, Principal p) {
        return respond(svc.attendance(p.getName(), classId), format, "attendance-report");
    }

    @GetMapping("/marks") @PreAuthorize("hasAnyRole('HOD','TEACHER')")
    public ResponseEntity<byte[]> marks(@RequestParam(required = false) Long classId, @RequestParam(required = false) Long subjectId,
                                        @RequestParam(defaultValue = "pdf") String format, Principal p) {
        return respond(svc.marksReport(p.getName(), classId, subjectId), format, "marks-report");
    }

    @GetMapping("/assignments") @PreAuthorize("hasAnyRole('HOD','TEACHER')")
    public ResponseEntity<byte[]> assignments(@RequestParam(required = false) Long classId, @RequestParam(defaultValue = "pdf") String format, Principal p) {
        return respond(svc.assignmentReport(p.getName(), classId), format, "assignment-report");
    }

    @GetMapping("/fees") @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<byte[]> fees(@RequestParam(defaultValue = "pdf") String format) {
        return respond(svc.feeReport(), format, "fee-report");
    }

    @GetMapping("/department") @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<byte[]> department(@RequestParam(defaultValue = "pdf") String format) {
        return respond(svc.departmentReport(), format, "department-performance-report");
    }

    private ResponseEntity<byte[]> respond(ReportDoc doc, String format, String baseName) {
        String f = format == null ? "pdf" : format.toLowerCase(Locale.ROOT);
        byte[] bytes;
        MediaType type;
        String ext;
        if (f.equals("pdf")) { bytes = PdfExporter.export(doc); type = MediaType.APPLICATION_PDF; ext = "pdf"; }
        else if (f.equals("csv")) { bytes = CsvExporter.export(doc); type = MediaType.parseMediaType("text/csv; charset=UTF-8"); ext = "csv"; }
        else if (f.equals("xlsx") || f.equals("excel")) {
            bytes = XlsxExporter.export(doc);
            type = MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            ext = "xlsx";
        } else throw new ApiException(HttpStatus.BAD_REQUEST, "Unsupported format. Use pdf, csv or xlsx.");
        String name = baseName + "-" + LocalDate.now() + "." + ext;
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(name).build().toString())
                .contentType(type)
                .body(bytes);
    }
}
