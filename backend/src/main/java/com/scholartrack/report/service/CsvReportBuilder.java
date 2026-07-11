package com.scholartrack.report.service;

import com.scholartrack.report.dto.*;
import java.text.DecimalFormat;

public final class CsvReportBuilder {
    private static String formatCurrency(java.math.BigDecimal amount) { return amount == null ? "Rs. 0.00" : "Rs. " + String.format("%.2f", amount); }

    private CsvReportBuilder() {}

    public static String escapeCell(String val) {
        if (val == null) return "";
        String s = val.trim();
        if (s.isEmpty()) return "";
        if (s.startsWith("=") || s.startsWith("+") || s.startsWith("-") || s.startsWith("@") || s.startsWith("\t") || s.startsWith("\r")) {
            s = "'" + s;
        }
        if (s.contains(",") || s.contains("\"") || s.contains("\n") || s.contains("\r")) {
            s = "\"" + s.replace("\"", "\"\"") + "\"";
        }
        return s;
    }

    public static String studentReportCsv(StudentTranscriptDto dto) {
        StringBuilder sb = new StringBuilder();
        sb.append("\uFEFF");
        sb.append("Student Academic Report\n");
        sb.append(dto.fullName()).append(" - ").append(dto.rollNo()).append("\n");
        sb.append("Generated,").append(dto.generatedDate()).append("\n");
        sb.append("Name,").append(escapeCell(dto.fullName())).append("\n");
        sb.append("Roll number,").append(escapeCell(dto.rollNo())).append("\n");
        sb.append("Class,").append(escapeCell(dto.className())).append("\n");
        sb.append("Semester,").append(dto.semesterNo()).append("\n");
        sb.append("SGPA,").append(String.format("%.2f", dto.sgpa())).append("\n");
        sb.append("CGPA,").append(String.format("%.2f", dto.cgpa())).append("\n");
        sb.append("Overall attendance,").append(String.format("%.1f%% (%d/%d classes)", dto.overallAttendancePercent(), dto.attendedClasses(), dto.totalClasses())).append("\n");
        sb.append("Academic risk indicator,").append(dto.riskLevel()).append(" (").append(dto.riskScore()).append("/100)\n\n");

        sb.append("Attendance by subject\n");
        sb.append("Subject,Attended,Total,Percent,Classes needed for 75%\n");
        for (var a : dto.attendanceBySubject()) {
            sb.append(escapeCell(a.subjectName())).append(",")
              .append(a.attended()).append(",")
              .append(a.total()).append(",")
              .append(String.format("%.1f%%", a.percent())).append(",")
              .append(a.classesNeededFor75()).append("\n");
        }
        sb.append("\n");

        sb.append("Subject results (current semester)\n");
        sb.append("Subject,Credits,Percentage,Grade point\n");
        for (var r : dto.subjectResults()) {
            sb.append(escapeCell(r.subjectName())).append(",")
              .append(r.credits()).append(",")
              .append(String.format("%.1f%%", r.percentage())).append(",")
              .append(r.gradePoint()).append("\n");
        }
        sb.append("\n");

        sb.append("Marks\n");
        sb.append("Subject,Assessment,Marks,Maximum\n");
        for (var m : dto.marks()) {
            sb.append(escapeCell(m.subjectCode())).append(",")
              .append(m.assessmentType()).append(",")
              .append(m.marks().stripTrailingZeros().toPlainString()).append(",")
              .append(m.maxMarks().stripTrailingZeros().toPlainString()).append("\n");
        }
        sb.append("\n");

        sb.append("Previous semesters\n");
        sb.append("Semester,SGPA,Credits\n");
        for (var p : dto.previousSemesters()) {
            sb.append(escapeCell(p.semesterLabel())).append(",")
              .append(String.format("%.2f", p.sgpa())).append(",")
              .append(p.credits()).append("\n");
        }
        sb.append("\n");

        sb.append("Fees\n");
        sb.append("Fee,Total,Late fee,Paid,Outstanding,Status,Due date\n");
        for (var f : dto.fees()) {
            sb.append(escapeCell(f.feeTitle())).append(",")
              .append(formatCurrency(f.totalAmount())).append(",")
              .append(formatCurrency(f.lateFee())).append(",")
              .append(formatCurrency(f.paidAmount())).append(",")
              .append(formatCurrency(f.outstandingAmount())).append(",")
              .append(f.status()).append(",")
              .append(f.dueDate()).append("\n");
        }
        return sb.toString();
    }

    public static String attendanceReportCsv(AttendanceStatisticsReportDto dto) {
        StringBuilder sb = new StringBuilder();
        sb.append("\uFEFF");
        sb.append("Attendance Report\n");
        sb.append(escapeCell(dto.className())).append("\n");
        sb.append("Generated,").append(dto.generatedDate()).append("\n");
        sb.append("Class,").append(escapeCell(dto.className())).append("\n");
        sb.append("Students,").append(dto.totalStudents()).append("\n");
        sb.append("Average attendance,").append(String.format("%.1f%%", dto.averageAttendancePercent())).append("\n");
        sb.append("Below 75%,").append(dto.below75Count()).append("\n\n");

        sb.append("Student attendance\n");
        sb.append("Roll no,Name,Class,Attended,Total,Percent,Status\n");
        for (var s : dto.studentAttendance()) {
            sb.append(escapeCell(s.rollNo())).append(",")
              .append(escapeCell(s.name())).append(",")
              .append(escapeCell(s.className())).append(",")
              .append(s.attended()).append(",")
              .append(s.total()).append(",")
              .append(String.format("%.1f%%", s.percent())).append(",")
              .append(s.status()).append("\n");
        }
        return sb.toString();
    }

    public static String feeReportCsv(FeePaymentAuditReportDto dto) {
        StringBuilder sb = new StringBuilder();
        sb.append("\uFEFF");
        sb.append("Fee Report\n");
        sb.append(escapeCell(dto.reportTitle())).append("\n");
        sb.append("Generated,").append(dto.generatedDate()).append("\n");
        sb.append("Total billed,").append(formatCurrency(dto.totalBilled())).append("\n");
        sb.append("Collected,").append(formatCurrency(dto.totalCollected())).append("\n");
        sb.append("Outstanding,").append(formatCurrency(dto.totalOutstanding())).append("\n");
        sb.append("Fees fully paid,").append(dto.feesFullyPaidCount()).append(" of ").append(dto.totalFeesCount()).append("\n");
        sb.append("Overdue,").append(dto.overdueCount()).append("\n\n");

        sb.append("Fees\n");
        sb.append("Roll no,Name,Fee,Total,Late fee,Paid,Outstanding,Status,Due date\n");
        for (var f : dto.fees()) {
            sb.append(escapeCell(f.rollNo())).append(",")
              .append(escapeCell(f.name())).append(",")
              .append(escapeCell(f.feeTitle())).append(",")
              .append(formatCurrency(f.totalAmount())).append(",")
              .append(formatCurrency(f.lateFee())).append(",")
              .append(formatCurrency(f.paidAmount())).append(",")
              .append(formatCurrency(f.outstandingAmount())).append(",")
              .append(f.status()).append(",")
              .append(f.dueDate()).append("\n");
        }
        return sb.toString();
    }
}
