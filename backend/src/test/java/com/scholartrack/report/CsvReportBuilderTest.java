package com.scholartrack.report;

import com.scholartrack.report.service.CsvReportBuilder;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CsvReportBuilderTest {
    @Test
    void testFormulaInjectionSanitization() {
        assertEquals("'=1+1", CsvReportBuilder.escapeCell("=1+1"));
        assertEquals("'+SUM(A1:A10)", CsvReportBuilder.escapeCell("+SUM(A1:A10)"));
        assertEquals("'-20", CsvReportBuilder.escapeCell("-20"));
        assertEquals("'@cmd", CsvReportBuilder.escapeCell("@cmd"));
        assertEquals("Normal Text", CsvReportBuilder.escapeCell("Normal Text"));
    }

    @Test
    void testCommaAndQuotesEscaping() {
        assertEquals("\"Doe, John\"", CsvReportBuilder.escapeCell("Doe, John"));
        assertEquals("\"Say \"\"Hello\"\"\"", CsvReportBuilder.escapeCell("Say \"Hello\""));
    }
}
