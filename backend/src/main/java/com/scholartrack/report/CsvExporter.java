package com.scholartrack.report;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

final class CsvExporter {
    private CsvExporter() {}

    static byte[] export(ReportDoc doc) {
        StringBuilder sb = new StringBuilder("\uFEFF");   // BOM so Excel opens UTF-8 correctly
        line(sb, List.of(doc.title()));
        if (doc.subtitle() != null && !doc.subtitle().isBlank()) line(sb, List.of(doc.subtitle()));
        line(sb, List.of("Generated", LocalDate.now().toString()));
        for (Map.Entry<String, String> e : doc.facts().entrySet()) line(sb, List.of(e.getKey(), e.getValue()));
        for (ReportDoc.Table t : doc.tables()) {
            sb.append("\r\n");
            line(sb, List.of(t.title()));
            line(sb, t.headers());
            for (List<String> row : t.rows()) line(sb, row);
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private static void line(StringBuilder sb, List<String> cells) {
        for (int i = 0; i < cells.size(); i++) {
            if (i > 0) sb.append(',');
            sb.append(escape(cells.get(i)));
        }
        sb.append("\r\n");
    }

    /** Quotes when needed and neutralises spreadsheet formula injection (cells starting with = + @ or a non-numeric -). */
    static String escape(String v) {
        String s = v == null ? "" : v;
        if (!s.isEmpty()) {
            char c = s.charAt(0);
            boolean formula = c == '=' || c == '+' || c == '@' || (c == '-' && s.length() > 1 && !Character.isDigit(s.charAt(1)) && s.charAt(1) != '.');
            if (formula) s = "'" + s;
        }
        if (s.contains(",") || s.contains("\"") || s.contains("\n") || s.contains("\r")) s = "\"" + s.replace("\"", "\"\"") + "\"";
        return s;
    }
}
