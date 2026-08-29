package com.scholartrack.activity;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    /** rows: [studentId, submissionCount] */
    @org.springframework.data.jpa.repository.Query("select s.student.id, count(s) from Submission s group by s.student.id")
    List<Object[]> countByStudent();

    long countByCourseworkId(Long courseworkId);
    Optional<Submission> findByCourseworkIdAndStudentId(Long courseworkId, Long studentId);

    @EntityGraph(attributePaths = {"student", "student.user", "coursework"})
    List<Submission> findByCourseworkId(Long courseworkId);

    @EntityGraph(attributePaths = {"coursework"})
    List<Submission> findByStudentId(Long studentId);
}
