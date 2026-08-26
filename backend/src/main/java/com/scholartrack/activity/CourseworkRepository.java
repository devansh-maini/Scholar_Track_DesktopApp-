package com.scholartrack.activity;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseworkRepository extends JpaRepository<Coursework, Long> {
    /** rows: [classId, assignmentCount] */
    @org.springframework.data.jpa.repository.Query("select c.classGroup.id, count(c) from Coursework c group by c.classGroup.id")
    List<Object[]> countByClass();

    List<Coursework> findByTeacherIdOrderByDeadlineDesc(Long teacherId);
    List<Coursework> findByClassGroupIdOrderByDeadlineAsc(Long classGroupId);
}
