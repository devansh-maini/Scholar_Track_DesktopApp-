package com.scholartrack.activity;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarkRepository extends JpaRepository<Mark, Long> {
    /** rows: [studentId, subjectId, sumMarks, sumMaxMarks] */
    @org.springframework.data.jpa.repository.Query("select m.student.id, m.subject.id, sum(m.marks), sum(m.maxMarks) from Mark m group by m.student.id, m.subject.id")
    List<Object[]> totalsByStudentSubject();

    Optional<Mark> findByStudentIdAndSubjectIdAndAssessmentType(Long studentId, Long subjectId, AssessmentType type);

    @EntityGraph(attributePaths = {"subject", "student", "student.user"})
    List<Mark> findByStudentId(Long studentId);

    @EntityGraph(attributePaths = {"subject", "student", "student.user"})
    List<Mark> findBySubjectIdAndStudentClassGroupIdOrderByStudentRollNo(Long subjectId, Long classGroupId);
}
