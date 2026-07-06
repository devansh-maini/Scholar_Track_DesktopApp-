package com.scholartrack.syllabus;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SyllabusProgressRepository extends JpaRepository<SyllabusProgress, Long> {
    Optional<SyllabusProgress> findByTopicIdAndClassGroupId(Long topicId, Long classGroupId);
    List<SyllabusProgress> findByClassGroupIdAndTopicSubjectId(Long classGroupId, Long subjectId);
}
