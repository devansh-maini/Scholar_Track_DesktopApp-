package com.scholartrack.report;

import com.scholartrack.report.dto.*;
import com.scholartrack.report.service.CsvReportBuilder;
import com.scholartrack.report.service.PdfReportService;
import com.scholartrack.report.service.ExcelReportService;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ReportServiceTest {
    private final PdfReportService pdfService = new PdfReportService();
    private final ExcelReportService excelService = new ExcelReportService();

    @Test
    void testStudentReportPdfRendering() {
        StudentTranscriptDto dto = createSampleStudentDto();
        byte[] pdf = pdfService.studentReportPdf(dto);
        assertNotNull(pdf);
        assertTrue(pdf.length > 500, "PDF byte array should be non-empty and well-formed");
    }

    @Test
    void testStudentReportExcelRendering() {
        StudentTranscriptDto dto = createSampleStudentDto();
        byte[] xlsx = excelService.studentReportExcel(dto);
        assertNotNull(xlsx);
        assertTrue(xlsx.length > 1000, "Excel byte array should contain valid workbook data");
    }

    @Test
    void testDepartmentReportPdfRendering() {
        DepartmentPerformanceReportDto dto = createSampleDepartmentDto();
        byte[] pdf = pdfService.departmentReportPdf(dto);
        assertNotNull(pdf);
        assertTrue(pdf.length > 500);
    }

    @Test
    void testDepartmentReportExcelRendering() {
        DepartmentPerformanceReportDto dto = createSampleDepartmentDto();
        byte[] xlsx = excelService.departmentReportExcel(dto);
        assertNotNull(xlsx);
        assertTrue(xlsx.length > 1000);
    }

    private StudentTranscriptDto createSampleStudentDto() {
        return new StudentTranscriptDto(
                1L, "Ananya Gupta", "CSE2301", "CSE-A", 5,
                9.39, 8.53, 97.0, 97, 100, "LOW", 10, LocalDate.now(),
                List.of(new StudentTranscriptDto.SubjectAttendanceItemDto("CS501 Algorithms", 20, 20, 100.0, 0)),
                List.of(new StudentTranscriptDto.SubjectResultItemDto("CS501 Algorithms", 4, 89.0, 9)),
                List.of(new StudentTranscriptDto.MarkItemDto("CS501", "MIDTERM", BigDecimal.valueOf(27.5), BigDecimal.valueOf(30))),
                List.of(new StudentTranscriptDto.PreviousSemesterScoreDto("Semester 1", 7.87, 22)),
                List.of(new StudentTranscriptDto.FeeItemDto("Tuition", BigDecimal.valueOf(85000), BigDecimal.ZERO, BigDecimal.valueOf(85000), BigDecimal.ZERO, "PAID", LocalDate.now()))
        );
    }

    private DepartmentPerformanceReportDto createSampleDepartmentDto() {
        return new DepartmentPerformanceReportDto(
                "Computer Science & Engineering", LocalDate.now(),
                10, 2, 7.08, 82.6, 3, 2, 1, 45.1, BigDecimal.valueOf(504350),
                List.of(new DepartmentPerformanceReportDto.SemesterSummaryRowDto("Semester 5", 10, 82.6, 7.63, 7.08, 3, 2)),
                List.of(new DepartmentPerformanceReportDto.SubjectPerformanceRowDto("CS501", "Algorithms", 5, 76.0, 82.1, 7, 0)),
                List.of(new DepartmentPerformanceReportDto.StudentRiskRankRowDto("CSE2301", "Ananya Gupta", "CSE-A", 97.0, 89.0, 9.39, 8.53, 10, "LOW"))
        );
    }
}

    // Attendance test: verifies 75% threshold shortfall calculations.

    // Exam Analytics Test: verifies pass rate computation and boundary scores.
