package com.scholartrack.activity;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AttendanceRepository extends JpaRepository<AttendanceRecord, Long> {
    Optional<AttendanceRecord> findByStudentIdAndSubjectIdAndAttendanceDate(Long studentId, Long subjectId, LocalDate date);
    List<AttendanceRecord> findBySubjectIdAndAttendanceDate(Long subjectId, LocalDate date);

    /** rows: [studentId, totalClasses, attendedClasses] */
    @Query("select a.student.id, count(a), sum(case when a.status = com.scholartrack.activity.AttendanceStatus.PRESENT then 1 else 0 end) "
         + "from AttendanceRecord a group by a.student.id")
    List<Object[]> totalsByStudent();

    /** rows: [subjectId, totalClasses, attendedClasses] for the whole department */
    @Query("select a.subject.id, count(a), sum(case when a.status = com.scholartrack.activity.AttendanceStatus.PRESENT then 1 else 0 end) "
         + "from AttendanceRecord a group by a.subject.id")
    List<Object[]> totalsBySubject();

    /** rows: [date, totalRecords, presentRecords] */
    @Query("select a.attendanceDate, count(a), sum(case when a.status = com.scholartrack.activity.AttendanceStatus.PRESENT then 1 else 0 end) "
         + "from AttendanceRecord a group by a.attendanceDate order by a.attendanceDate")
    List<Object[]> dailyTotals();

    /** rows: [subjectId, totalClasses, attendedClasses] */
    @Query("select a.subject.id, count(a), sum(case when a.status = com.scholartrack.activity.AttendanceStatus.PRESENT then 1 else 0 end) "
         + "from AttendanceRecord a where a.student.id = :sid group by a.subject.id")
    List<Object[]> countBySubject(@Param("sid") Long studentId);
}
