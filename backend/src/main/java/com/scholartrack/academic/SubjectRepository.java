package com.scholartrack.academic;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    boolean existsByCodeIgnoreCase(String code);
    List<Subject> findBySemesterNoOrderByCode(int semesterNo);
}
