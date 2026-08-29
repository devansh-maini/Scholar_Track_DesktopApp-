package com.scholartrack.activity;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SemesterResultRepository extends JpaRepository<SemesterResult, Long> {
    List<SemesterResult> findByStudentIdAndSemesterNoLessThanOrderBySemesterNo(Long studentId, int semesterNo);
}
