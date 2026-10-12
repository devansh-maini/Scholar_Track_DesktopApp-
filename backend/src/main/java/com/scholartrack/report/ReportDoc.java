package com.scholartrack.report;

import java.util.List;
import java.util.Map;

/** Format-neutral report: a title, key facts and one or more tables. Rendered to PDF, CSV or Excel. */
public record ReportDoc(String title, String subtitle, Map<String, String> facts, List<Table> tables) {
    public record Table(String title, List<String> headers, List<List<String>> rows) {}
}
