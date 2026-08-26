package com.scholartrack.academic;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    boolean existsByEmployeeCode(String employeeCode);
    Optional<Teacher> findByUserId(Long userId);
}
