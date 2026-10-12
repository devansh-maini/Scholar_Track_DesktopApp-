package com.scholartrack.report;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

final class XlsxExporter {
    private XlsxExporter() {}

    static byte[] export(ReportDoc doc) {
        try (XSSFWorkbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Font bold = wb.createFont();
            bold.setBold(true);
            CellStyle head = wb.createCellStyle();
            head.setFont(bold);
            head.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            head.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            CellStyle titleStyle = wb.createCellStyle();
            titleStyle.setFont(bold);

            Set<String> names = new HashSet<>();
            Sheet summary = wb.createSheet(sheetName("Summary", names));
            int r = 0;
            cell(summary.createRow(r++), 0, doc.title(), titleStyle);
            if (doc.subtitle() != null && !doc.subtitle().isBlank()) cell(summary.createRow(r++), 0, doc.subtitle(), null);
            cell(summary.createRow(r++), 0, "Generated " + LocalDate.now(), null);
            r++;
            for (Map.Entry<String, String> e : doc.facts().entrySet()) {
                Row row = summary.createRow(r++);
                cell(row, 0, e.getKey(), titleStyle);
                cell(row, 1, e.getValue(), null);
            }
            summary.setColumnWidth(0, 28 * 256);
            summary.setColumnWidth(1, 36 * 256);

            for (ReportDoc.Table t : doc.tables()) {
                Sheet sh = wb.createSheet(sheetName(t.title(), names));
                Row hr = sh.createRow(0);
                for (int c = 0; c < t.headers().size(); c++) { cell(hr, c, t.headers().get(c), head); sh.setColumnWidth(c, 18 * 256); }
                int rowNo = 1;
                for (List<String> rowData : t.rows()) {
                    Row row = sh.createRow(rowNo++);
                    for (int c = 0; c < rowData.size(); c++) cell(row, c, rowData.get(c), null);
                }
                sh.createFreezePane(0, 1);
            }
            wb.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("Could not build the Excel file", e);
        }
    }

    /** Numbers become numeric cells; everything else is stored as plain text (never as a formula). */
    private static void cell(Row row, int col, String value, CellStyle style) {
        Cell c = row.createCell(col);
        String v = value == null ? "" : value;
        if (v.matches("-?\\d+(\\.\\d+)?")) c.setCellValue(Double.parseDouble(v)); else c.setCellValue(v);
        if (style != null) c.setCellStyle(style);
    }

    private static String sheetName(String raw, Set<String> used) {
        String base = raw.replaceAll("[\\\\/?*\\[\\]:]", " ").trim();
        if (base.isEmpty()) base = "Sheet";
        if (base.length() > 28) base = base.substring(0, 28);
        String name = base;
        int i = 2;
        while (!used.add(name.toLowerCase())) name = base + " " + i++;
        return name;
    }
}
