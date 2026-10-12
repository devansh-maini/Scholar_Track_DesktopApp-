package com.scholartrack.syllabus;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SyllabusTopicRepository extends JpaRepository<SyllabusTopic, Long> {
    List<SyllabusTopic> findBySubjectIdOrderBySortOrder(Long subjectId);
}
