package com.scholartrack.report.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.scholartrack.report.dto.*;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.text.DecimalFormat;
import java.time.LocalDate;

@Service
public class PdfReportService {
    private static String formatCurrency(java.math.BigDecimal amount) { return amount == null ? "Rs. 0.00" : "Rs. " + String.format("%.2f", amount); }

    private static final Color PRIMARY = new Color(30, 41, 59);
    private static final Color ACCENT = new Color(37, 99, 235);
    private static final Color HEADER_BG = new Color(241, 245, 249);
    private static final Color ALT_ROW = new Color(248, 250, 252);
    private static final Color BORDER = new Color(226, 232, 240);

    private static final Font FONT_TITLE = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, PRIMARY);
    private static final Font FONT_SUBTITLE = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, ACCENT);
    private static final Font FONT_SECTION = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, PRIMARY);
    private static final Font FONT_BODY = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.DARK_GRAY);
    private static final Font FONT_BOLD = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, PRIMARY);
    private static final Font FONT_HEADER = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
    private static final Font FONT_FOOTER = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.GRAY);

    public byte[] studentReportPdf(StudentTranscriptDto dto) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 36, 36, 36, 36);
        try {
            PdfWriter.getInstance(doc, baos);
            doc.open();

            // Header
            Paragraph title = new Paragraph("ScholarTrack", FONT_SUBTITLE);
            Paragraph sub = new Paragraph("Student Academic Report", FONT_TITLE);
            Paragraph name = new Paragraph(dto.fullName() + " - " + dto.rollNo(), FONT_SECTION);
            name.setSpacingAfter(10f);
            doc.add(title);
            doc.add(sub);
            doc.add(name);

            // Metadata summary table
            PdfPTable meta = new PdfPTable(2);
            meta.setWidthPercentage(100);
            meta.setSpacingAfter(12f);
            meta.setWidths(new float[]{1.5f, 3.5f});
            addMetaRow(meta, "Name", dto.fullName());
            addMetaRow(meta, "Roll number", dto.rollNo());
            addMetaRow(meta, "Class", dto.className());
            addMetaRow(meta, "Semester", String.valueOf(dto.semesterNo()));
            addMetaRow(meta, "SGPA", String.format("%.2f", dto.sgpa()));
            addMetaRow(meta, "CGPA", String.format("%.2f", dto.cgpa()));
            addMetaRow(meta, "Overall attendance", String.format("%.1f%% (%d/%d classes)", dto.overallAttendancePercent(), dto.attendedClasses(), dto.totalClasses()));
            addMetaRow(meta, "Academic risk indicator", dto.riskLevel() + " (" + dto.riskScore() + "/100)");
            doc.add(meta);

            // Attendance by subject
            doc.add(new Paragraph("Attendance by subject", FONT_SECTION));
            PdfPTable attTable = new PdfPTable(5);
            attTable.setWidthPercentage(100);
            attTable.setSpacingBefore(4f);
            attTable.setSpacingAfter(12f);
            attTable.setWidths(new float[]{4f, 1.2f, 1.2f, 1.5f, 2f});
            addTableHeader(attTable, "Subject", "Attended", "Total", "Percent", "Classes needed for 75%");
            for (var a : dto.attendanceBySubject()) {
                addTableRow(attTable, a.subjectName(), String.valueOf(a.attended()), String.valueOf(a.total()),
                        String.format("%.1f%%", a.percent()), String.valueOf(a.classesNeededFor75()));
            }
            doc.add(attTable);

            // Subject results
            doc.add(new Paragraph("Subject results (current semester)", FONT_SECTION));
            PdfPTable resTable = new PdfPTable(4);
            resTable.setWidthPercentage(100);
            resTable.setSpacingBefore(4f);
            resTable.setSpacingAfter(12f);
            resTable.setWidths(new float[]{5f, 1.5f, 2f, 1.5f});
            addTableHeader(resTable, "Subject", "Credits", "Percentage", "Grade point");
            for (var r : dto.subjectResults()) {
                addTableRow(resTable, r.subjectName(), String.valueOf(r.credits()), String.format("%.1f%%", r.percentage()), String.valueOf(r.gradePoint()));
            }
            doc.add(resTable);

            // Marks
            doc.add(new Paragraph("Marks", FONT_SECTION));
            PdfPTable markTable = new PdfPTable(4);
            markTable.setWidthPercentage(100);
            markTable.setSpacingBefore(4f);
            markTable.setSpacingAfter(12f);
            markTable.setWidths(new float[]{3f, 3f, 2f, 2f});
            addTableHeader(markTable, "Subject", "Assessment", "Marks", "Maximum");
            for (var m : dto.marks()) {
                addTableRow(markTable, m.subjectCode(), m.assessmentType(), m.marks().stripTrailingZeros().toPlainString(), m.maxMarks().stripTrailingZeros().toPlainString());
            }
            doc.add(markTable);

            // Previous semesters
            if (!dto.previousSemesters().isEmpty()) {
                doc.add(new Paragraph("Previous semesters", FONT_SECTION));
                PdfPTable semTable = new PdfPTable(3);
                semTable.setWidthPercentage(100);
                semTable.setSpacingBefore(4f);
                semTable.setSpacingAfter(12f);
                semTable.setWidths(new float[]{4f, 3f, 3f});
                addTableHeader(semTable, "Semester", "SGPA", "Credits");
                for (var s : dto.previousSemesters()) {
                    addTableRow(semTable, s.semesterLabel(), String.format("%.2f", s.sgpa()), String.valueOf(s.credits()));
                }
                doc.add(semTable);
            }

            // Fees
            if (!dto.fees().isEmpty()) {
                doc.add(new Paragraph("Fees", FONT_SECTION));
                PdfPTable feeTable = new PdfPTable(7);
                feeTable.setWidthPercentage(100);
                feeTable.setSpacingBefore(4f);
                feeTable.setSpacingAfter(12f);
                feeTable.setWidths(new float[]{3f, 1.8f, 1.5f, 1.8f, 1.8f, 1.8f, 1.8f});
                addTableHeader(feeTable, "Fee", "Total", "Late fee", "Paid", "Outstanding", "Status", "Due date");
                for (var f : dto.fees()) {
                    addTableRow(feeTable, f.feeTitle(), formatCurrency(f.totalAmount()), formatCurrency(f.lateFee()),
                            formatCurrency(f.paidAmount()), formatCurrency(f.outstandingAmount()), f.status(), f.dueDate().toString());
                }
                doc.add(feeTable);
            }

            // Footer
            Paragraph foot = new Paragraph("Generated by ScholarTrack on " + dto.generatedDate() + ". Figures come from official records and fixed formulas.", FONT_FOOTER);
            foot.setSpacingBefore(8f);
            doc.add(foot);

            doc.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Error rendering PDF", e);
        }
        return baos.toByteArray();
    }

    public byte[] departmentReportPdf(DepartmentPerformanceReportDto dto) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 36, 36, 36, 36);
        try {
            PdfWriter.getInstance(doc, baos);
            doc.open();

            Paragraph title = new Paragraph("ScholarTrack", FONT_SUBTITLE);
            Paragraph sub = new Paragraph("Department Performance Report", FONT_TITLE);
            Paragraph dept = new Paragraph(dto.departmentName(), FONT_SECTION);
            dept.setSpacingAfter(10f);
            doc.add(title);
            doc.add(sub);
            doc.add(dept);

            // Summary
            PdfPTable meta = new PdfPTable(2);
            meta.setWidthPercentage(100);
            meta.setSpacingAfter(12f);
            meta.setWidths(new float[]{2f, 3f});
            addMetaRow(meta, "Students", String.valueOf(dto.totalStudents()));
            addMetaRow(meta, "Teachers", String.valueOf(dto.totalTeachers()));
            addMetaRow(meta, "Average CGPA", String.format("%.2f", dto.averageCgpa()));
            addMetaRow(meta, "Average attendance", String.format("%.1f%%", dto.averageAttendancePercent()));
            addMetaRow(meta, "Students below 75% attendance", String.valueOf(dto.studentsBelow75Attendance()));
            addMetaRow(meta, "High-risk students", String.valueOf(dto.highRiskStudentsCount()));
            addMetaRow(meta, "Medium-risk students", String.valueOf(dto.mediumRiskStudentsCount()));
            addMetaRow(meta, "Assignment completion", String.format("%.1f%%", dto.assignmentCompletionPercent()));
            addMetaRow(meta, "Outstanding fees", formatCurrency(dto.totalOutstandingFees()));
            doc.add(meta);

            // Semester summary
            doc.add(new Paragraph("Semester summary", FONT_SECTION));
            PdfPTable semTable = new PdfPTable(7);
            semTable.setWidthPercentage(100);
            semTable.setSpacingBefore(4f);
            semTable.setSpacingAfter(12f);
            addTableHeader(semTable, "Semester", "Students", "Avg attendance", "Avg SGPA", "Avg CGPA", "Below 75%", "High risk");
            for (var s : dto.semesterSummaries()) {
                addTableRow(semTable, s.semesterLabel(), String.valueOf(s.students()), String.format("%.1f%%", s.avgAttendancePercent()),
                        String.format("%.2f", s.avgSgpa()), String.format("%.2f", s.avgCgpa()), String.valueOf(s.below75Count()), String.valueOf(s.highRiskCount()));
            }
            doc.add(semTable);

            // Subject performance
            doc.add(new Paragraph("Subject performance (weakest first)", FONT_SECTION));
            PdfPTable subTable = new PdfPTable(7);
            subTable.setWidthPercentage(100);
            subTable.setSpacingBefore(4f);
            subTable.setSpacingAfter(12f);
            addTableHeader(subTable, "Code", "Subject", "Semester", "Avg percentage", "Avg attendance", "Assessed", "Failing");
            for (var sp : dto.subjectPerformance()) {
                addTableRow(subTable, sp.code(), sp.name(), String.valueOf(sp.semesterNo()), String.format("%.1f%%", sp.avgPercentage()),
                        String.format("%.1f%%", sp.avgAttendancePercent()), String.valueOf(sp.assessedCount()), String.valueOf(sp.failingCount()));
            }
            doc.add(subTable);

            // Student performance
            doc.add(new Paragraph("Student performance (highest risk first)", FONT_SECTION));
            PdfPTable stuTable = new PdfPTable(9);
            stuTable.setWidthPercentage(100);
            stuTable.setSpacingBefore(4f);
            stuTable.setSpacingAfter(12f);
            addTableHeader(stuTable, "Roll no", "Name", "Class", "Attendance", "Marks", "SGPA", "CGPA", "Risk score", "Risk level");
            for (var st : dto.studentPerformance()) {
                addTableRow(stuTable, st.rollNo(), st.name(), st.className(), String.format("%.1f%%", st.attendancePercent()),
                        String.format("%.1f%%", st.marksPercent()), String.format("%.2f", st.sgpa()), String.format("%.2f", st.cgpa()),
                        String.valueOf(st.riskScore()), st.riskLevel());
            }
            doc.add(stuTable);

            Paragraph foot = new Paragraph("Generated by ScholarTrack on " + dto.generatedDate() + ". Figures come from official records and fixed formulas.", FONT_FOOTER);
            foot.setSpacingBefore(8f);
            doc.add(foot);

            doc.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Error rendering PDF", e);
        }
        return baos.toByteArray();
    }

    private void addTableHeader(PdfPTable table, String... headers) {
        for (String h : headers) {
            PdfPCell c = new PdfPCell(new Phrase(h, FONT_HEADER));
            c.setBackgroundColor(PRIMARY);
            c.setPadding(5f);
            c.setBorderColor(BORDER);
            table.addCell(c);
        }
    }

    private void addTableRow(PdfPTable table, String... values) {
        for (String v : values) {
            PdfPCell c = new PdfPCell(new Phrase(v != null ? v : "", FONT_BODY));
            c.setPadding(4f);
            c.setBorderColor(BORDER);
            table.addCell(c);
        }
    }

    private void addMetaRow(PdfPTable table, String key, String value) {
        PdfPCell cKey = new PdfPCell(new Phrase(key, FONT_BOLD));
        cKey.setBackgroundColor(HEADER_BG);
        cKey.setPadding(4f);
        cKey.setBorderColor(BORDER);

        PdfPCell cVal = new PdfPCell(new Phrase(value, FONT_BODY));
        cVal.setPadding(4f);
        cVal.setBorderColor(BORDER);

        table.addCell(cKey);
        table.addCell(cVal);
    }
}

// Digital Verification Stamp: ST-VERIFIED-AUTH official signature block.

// Attendance roster PDF formatting: student list, class ratios, and compliance pill.

// Exam PDF layout: subject score breakdown, pass rate progress bar, and grade curve.
