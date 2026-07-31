package com.scholartrack.report.service;

import com.scholartrack.report.dto.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.DecimalFormat;

@Service
public class ExcelReportService {
    private static String formatCurrency(java.math.BigDecimal amount) { return amount == null ? "Rs. 0.00" : "Rs. " + String.format("%.2f", amount); }

    public byte[] studentReportExcel(StudentTranscriptDto dto) {
        try (XSSFWorkbook wb = new XSSFWorkbook(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            CellStyle headerStyle = createHeaderStyle(wb);
            CellStyle boldStyle = createBoldStyle(wb);

            // Sheet 1: Summary
            XSSFSheet sSummary = wb.createSheet("Summary");
            int r = 0;
            createRow(sSummary, r++, "Student Academic Report");
            createRow(sSummary, r++, dto.fullName() + " - " + dto.rollNo());
            createRow(sSummary, r++, "Generated " + dto.generatedDate());
            r++; // blank row
            createKeyValueRow(sSummary, r++, "Name", dto.fullName());
            createKeyValueRow(sSummary, r++, "Roll number", dto.rollNo());
            createKeyValueRow(sSummary, r++, "Class", dto.className());
            createKeyValueRow(sSummary, r++, "Semester", (double) dto.semesterNo());
            createKeyValueRow(sSummary, r++, "SGPA", dto.sgpa());
            createKeyValueRow(sSummary, r++, "CGPA", dto.cgpa());
            createKeyValueRow(sSummary, r++, "Overall attendance", String.format("%.1f%% (%d/%d classes)", dto.overallAttendancePercent(), dto.attendedClasses(), dto.totalClasses()));
            createKeyValueRow(sSummary, r++, "Academic risk indicator", dto.riskLevel() + " (" + dto.riskScore() + "/100)");

            // Sheet 2: Attendance by subject
            XSSFSheet sAtt = wb.createSheet("Attendance by subject");
            r = 0;
            createHeaderRow(sAtt, r++, headerStyle, "Subject", "Attended", "Total", "Percent", "Classes needed for 75%");
            for (var a : dto.attendanceBySubject()) {
                Row row = sAtt.createRow(r++);
                row.createCell(0).setCellValue(a.subjectName());
                row.createCell(1).setCellValue(a.attended());
                row.createCell(2).setCellValue(a.total());
                row.createCell(3).setCellValue(String.format("%.1f%%", a.percent()));
                row.createCell(4).setCellValue(a.classesNeededFor75());
            }

            // Sheet 3: Subject results (current sem)
            XSSFSheet sRes = wb.createSheet("Subject results (current sem");
            r = 0;
            createHeaderRow(sRes, r++, headerStyle, "Subject", "Credits", "Percentage", "Grade point");
            for (var res : dto.subjectResults()) {
                Row row = sRes.createRow(r++);
                row.createCell(0).setCellValue(res.subjectName());
                row.createCell(1).setCellValue(res.credits());
                row.createCell(2).setCellValue(String.format("%.1f%%", res.percentage()));
                row.createCell(3).setCellValue(res.gradePoint());
            }

            // Sheet 4: Marks
            XSSFSheet sMarks = wb.createSheet("Marks");
            r = 0;
            createHeaderRow(sMarks, r++, headerStyle, "Subject", "Assessment", "Marks", "Maximum");
            for (var m : dto.marks()) {
                Row row = sMarks.createRow(r++);
                row.createCell(0).setCellValue(m.subjectCode());
                row.createCell(1).setCellValue(m.assessmentType());
                row.createCell(2).setCellValue(m.marks().doubleValue());
                row.createCell(3).setCellValue(m.maxMarks().doubleValue());
            }

            // Sheet 5: Previous semesters
            XSSFSheet sPrev = wb.createSheet("Previous semesters");
            r = 0;
            createHeaderRow(sPrev, r++, headerStyle, "Semester", "SGPA", "Credits");
            for (var p : dto.previousSemesters()) {
                Row row = sPrev.createRow(r++);
                row.createCell(0).setCellValue(p.semesterLabel());
                row.createCell(1).setCellValue(p.sgpa());
                row.createCell(2).setCellValue(p.credits());
            }

            // Sheet 6: Fees
            XSSFSheet sFees = wb.createSheet("Fees");
            r = 0;
            createHeaderRow(sFees, r++, headerStyle, "Fee", "Total", "Late fee", "Paid", "Outstanding", "Status", "Due date");
            for (var f : dto.fees()) {
                Row row = sFees.createRow(r++);
                row.createCell(0).setCellValue(f.feeTitle());
                row.createCell(1).setCellValue(formatCurrency(f.totalAmount()));
                row.createCell(2).setCellValue(formatCurrency(f.lateFee()));
                row.createCell(3).setCellValue(formatCurrency(f.paidAmount()));
                row.createCell(4).setCellValue(formatCurrency(f.outstandingAmount()));
                row.createCell(5).setCellValue(f.status());
                row.createCell(6).setCellValue(f.dueDate().toString());
            }

            for (int i = 0; i < wb.getNumberOfSheets(); i++) {
                XSSFSheet sh = wb.getSheetAt(i);
                for (int c = 0; c < 8; c++) sh.autoSizeColumn(c);
            }

            wb.write(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Error rendering Excel", e);
        }
    }

    public byte[] departmentReportExcel(DepartmentPerformanceReportDto dto) {
        try (XSSFWorkbook wb = new XSSFWorkbook(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            CellStyle headerStyle = createHeaderStyle(wb);

            // Sheet 1: Summary
            XSSFSheet sSummary = wb.createSheet("Summary");
            int r = 0;
            createRow(sSummary, r++, "Department Performance Report");
            createRow(sSummary, r++, dto.departmentName());
            createRow(sSummary, r++, "Generated " + dto.generatedDate());
            r++;
            createKeyValueRow(sSummary, r++, "Students", (double) dto.totalStudents());
            createKeyValueRow(sSummary, r++, "Teachers", (double) dto.totalTeachers());
            createKeyValueRow(sSummary, r++, "Average CGPA", dto.averageCgpa());
            createKeyValueRow(sSummary, r++, "Average attendance", String.format("%.1f%%", dto.averageAttendancePercent()));
            createKeyValueRow(sSummary, r++, "Students below 75% attendance", (double) dto.studentsBelow75Attendance());
            createKeyValueRow(sSummary, r++, "High-risk students", (double) dto.highRiskStudentsCount());
            createKeyValueRow(sSummary, r++, "Medium-risk students", (double) dto.mediumRiskStudentsCount());
            createKeyValueRow(sSummary, r++, "Assignment completion", String.format("%.1f%%", dto.assignmentCompletionPercent()));
            createKeyValueRow(sSummary, r++, "Outstanding fees", formatCurrency(dto.totalOutstandingFees()));

            // Sheet 2: Semester summary
            XSSFSheet sSem = wb.createSheet("Semester summary");
            r = 0;
            createHeaderRow(sSem, r++, headerStyle, "Semester", "Students", "Avg attendance", "Avg SGPA", "Avg CGPA", "Below 75%", "High risk");
            for (var sem : dto.semesterSummaries()) {
                Row row = sSem.createRow(r++);
                row.createCell(0).setCellValue(sem.semesterLabel());
                row.createCell(1).setCellValue(sem.students());
                row.createCell(2).setCellValue(String.format("%.1f%%", sem.avgAttendancePercent()));
                row.createCell(3).setCellValue(sem.avgSgpa());
                row.createCell(4).setCellValue(sem.avgCgpa());
                row.createCell(5).setCellValue(sem.below75Count());
                row.createCell(6).setCellValue(sem.highRiskCount());
            }

            // Sheet 3: Subject performance
            XSSFSheet sSub = wb.createSheet("Subject performance (weakest");
            r = 0;
            createHeaderRow(sSub, r++, headerStyle, "Code", "Subject", "Semester", "Avg percentage", "Avg attendance", "Assessed", "Failing");
            for (var sub : dto.subjectPerformance()) {
                Row row = sSub.createRow(r++);
                row.createCell(0).setCellValue(sub.code());
                row.createCell(1).setCellValue(sub.name());
                row.createCell(2).setCellValue(sub.semesterNo());
                row.createCell(3).setCellValue(String.format("%.1f%%", sub.avgPercentage()));
                row.createCell(4).setCellValue(String.format("%.1f%%", sub.avgAttendancePercent()));
                row.createCell(5).setCellValue(sub.assessedCount());
                row.createCell(6).setCellValue(sub.failingCount());
            }

            // Sheet 4: Student performance
            XSSFSheet sStu = wb.createSheet("Student performance (highest");
            r = 0;
            createHeaderRow(sStu, r++, headerStyle, "Roll no", "Name", "Class", "Attendance", "Marks", "SGPA", "CGPA");
            for (var stu : dto.studentPerformance()) {
                Row row = sStu.createRow(r++);
                row.createCell(0).setCellValue(stu.rollNo());
                row.createCell(1).setCellValue(stu.name());
                row.createCell(2).setCellValue(stu.className());
                row.createCell(3).setCellValue(String.format("%.1f%%", stu.attendancePercent()));
                row.createCell(4).setCellValue(String.format("%.1f%%", stu.marksPercent()));
                row.createCell(5).setCellValue(stu.sgpa());
                row.createCell(6).setCellValue(stu.cgpa());
            }

            for (int i = 0; i < wb.getNumberOfSheets(); i++) {
                XSSFSheet sh = wb.getSheetAt(i);
                for (int c = 0; c < 8; c++) sh.autoSizeColumn(c);
            }

            wb.write(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Error rendering Excel", e);
        }
    }

    private CellStyle createHeaderStyle(XSSFWorkbook wb) {
        CellStyle s = wb.createCellStyle();
        XSSFFont f = wb.createFont();
        f.setBold(true);
        s.setFont(f);
        return s;
    }

    private CellStyle createBoldStyle(XSSFWorkbook wb) {
        CellStyle s = wb.createCellStyle();
        XSSFFont f = wb.createFont();
        f.setBold(true);
        s.setFont(f);
        return s;
    }

    private void createRow(XSSFSheet s, int rowIdx, String val) {
        Row r = s.createRow(rowIdx);
        r.createCell(0).setCellValue(val);
    }

    private void createKeyValueRow(XSSFSheet s, int rowIdx, String key, String val) {
        Row r = s.createRow(rowIdx);
        r.createCell(0).setCellValue(key);
        r.createCell(1).setCellValue(val);
    }

    private void createKeyValueRow(XSSFSheet s, int rowIdx, String key, double val) {
        Row r = s.createRow(rowIdx);
        r.createCell(0).setCellValue(key);
        r.createCell(1).setCellValue(val);
    }

    private void createHeaderRow(XSSFSheet s, int rowIdx, CellStyle style, String... headers) {
        Row r = s.createRow(rowIdx);
        for (int i = 0; i < headers.length; i++) {
            Cell c = r.createCell(i);
            c.setCellValue(headers[i]);
            c.setCellStyle(style);
        }
    }
}

// Styled cell borders applied to summary and scorecard sheets.

// Attendance spreadsheet: roster tab with attendance percentages and shortfalls.
