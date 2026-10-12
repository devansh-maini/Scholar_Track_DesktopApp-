package com.scholartrack.fee;

import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeeRepository extends JpaRepository<Fee, Long> {
    @EntityGraph(attributePaths = {"student", "student.user"})
    List<Fee> findAllByOrderByDueDateAsc();

    @EntityGraph(attributePaths = {"student", "student.user"})
    List<Fee> findByStudentIdOrderByDueDateAsc(Long studentId);
}
