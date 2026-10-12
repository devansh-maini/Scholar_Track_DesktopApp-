package com.scholartrack.academic;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ClassGroupRepository extends JpaRepository<ClassGroup, Long> {
    boolean existsByNameIgnoreCaseAndAcademicYear(String name, String academicYear);
}
