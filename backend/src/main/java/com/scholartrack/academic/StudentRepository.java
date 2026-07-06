package com.scholartrack.academic;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StudentRepository extends JpaRepository<Student, Long> {
    boolean existsByRollNo(String rollNo);

    @EntityGraph(attributePaths = {"user", "department", "classGroup"})
    List<Student> findAllByOrderByRollNo();
    Optional<Student> findByUserId(Long userId);

    @EntityGraph(attributePaths = {"user", "department", "classGroup"})
    List<Student> findByClassGroupIdOrderByRollNo(Long classGroupId);

    @EntityGraph(attributePaths = {"user", "department", "classGroup"})
    @Query("select s from Student s join s.user u where lower(u.fullName) like lower(concat('%', :q, '%')) "
         + "or lower(s.rollNo) like lower(concat('%', :q, '%'))")
    Page<Student> search(@Param("q") String q, Pageable pageable);
}
