package com.scholartrack.academic;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherAssignmentRepository extends JpaRepository<TeacherAssignment, Long> {
    List<TeacherAssignment> findByTeacherId(Long teacherId);
    List<TeacherAssignment> findByClassGroupId(Long classGroupId);
    boolean existsByTeacherIdAndClassGroupId(Long teacherId, Long classGroupId);
    boolean existsByTeacherIdAndSubjectIdAndClassGroupId(Long teacherId, Long subjectId, Long classGroupId);
}
