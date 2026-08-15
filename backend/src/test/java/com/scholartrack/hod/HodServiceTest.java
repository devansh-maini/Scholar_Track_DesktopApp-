package com.scholartrack.hod;

import static org.junit.jupiter.api.Assertions.*;

import com.scholartrack.hod.HodDtos.*;
import java.util.List;
import org.junit.jupiter.api.Test;

class HodServiceTest {

    @Test
    void testDepartmentStatsDtoStructure() {
        DepartmentStatsDto dto = new DepartmentStatsDto(
                1L, "CSE", "Computer Science", 120, 15, 8, 78.5, 68.2);

        assertEquals(1L, dto.id());
        assertEquals("CSE", dto.code());
        assertEquals("Computer Science", dto.name());
        assertEquals(120, dto.totalStudents());
        assertEquals(15, dto.totalTeachers());
        assertEquals(8, dto.atRiskStudents());
        assertEquals(78.5, dto.avgAttendance());
        assertEquals(68.2, dto.avgMarks());
    }

    @Test
    void testDepartmentOverviewDtoAggregation() {
        DepartmentStatsDto cse = new DepartmentStatsDto(1L, "CSE", "Computer Science", 100, 10, 5, 80.0, 70.0);
        DepartmentStatsDto ece = new DepartmentStatsDto(2L, "ECE", "Electronics", 80, 8, 4, 75.0, 65.0);

        DepartmentOverviewDto overview = new DepartmentOverviewDto(
                "Dr. Sharma", 180, 18, 9, 77.5, 67.5, List.of(cse, ece));

        assertEquals("Dr. Sharma", overview.hodName());
        assertEquals(180, overview.totalStudents());
        assertEquals(18, overview.totalTeachers());
        assertEquals(9, overview.atRiskStudents());
        assertEquals(2, overview.departments().size());
    }

    @Test
    void testTeacherAllocationDtoRecord() {
        SubjectClassDto sub = new SubjectClassDto(10L, "CS301", "Operating Systems", 1L, "CSE-A");
        TeacherAllocationDto ta = new TeacherAllocationDto(
                5L, "Prof. Verma", "verma@university.edu", "EMP042", "CSE", List.of(sub));

        assertEquals(5L, ta.teacherId());
        assertEquals("Prof. Verma", ta.fullName());
        assertEquals(1, ta.allocations().size());
        assertEquals("CS301", ta.allocations().get(0).subjectCode());
        assertEquals("CSE-A", ta.allocations().get(0).className());
    }

    @Test
    void testAtRiskStudentReasons() {
        AtRiskStudentDto atRisk = new AtRiskStudentDto(
                101L, "Rohan Gupta", "2026CSE045", "CSE", "CSE-B", 62.5, 34.0, "HIGH",
                List.of("Attendance 62.5% — below 75% requirement",
                        "Average marks 34.0% — below 40% passing threshold"));

        assertEquals("HIGH", atRisk.riskLevel());
        assertEquals(2, atRisk.reasons().size());
        assertTrue(atRisk.attendancePct() < 75);
        assertTrue(atRisk.avgMarks() < 40);
    }
}
