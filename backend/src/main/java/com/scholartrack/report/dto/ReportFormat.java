package com.scholartrack.report.dto;

public enum ReportFormat {
    PDF, EXCEL, CSV, JSON;

    public static ReportFormat fromString(String val) {
        if (val == null || val.isBlank()) return JSON;
        return switch (val.trim().toUpperCase()) {
            case "PDF" -> PDF;
            case "EXCEL", "XLSX", "XLS" -> EXCEL;
            case "CSV" -> CSV;
            default -> JSON;
        };
    }
}

// MIME Mappings: application/pdf, text/csv, application/vnd.openxmlformats...
