package com.scholartrack.syllabus;

import com.scholartrack.academic.*;
import com.scholartrack.activity.AcademicCalc;
import com.scholartrack.common.ApiException;
import com.scholartrack.live.LiveEvent;
import com.scholartrack.live.LiveEventPublisher;
import com.scholartrack.syllabus.SyllabusDtos.*;
import com.scholartrack.user.User;
import com.scholartrack.user.UserRepository;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SyllabusService {
    private final SyllabusTopicRepository topics;
    private final SyllabusProgressRepository progress;
    private final SubjectRepository subjects;
    private final ClassGroupRepository classes;
    private final TeacherRepository teachers;
    private final StudentRepository students;
    private final TeacherAssignmentRepository assignments;
    private final UserRepository users;
    private final LiveEventPublisher live;

    public SyllabusService(SyllabusTopicRepository topics, SyllabusProgressRepository progress, SubjectRepository subjects,
                           ClassGroupRepository classes, TeacherRepository teachers, StudentRepository students,
                           TeacherAssignmentRepository assignments, UserRepository users, LiveEventPublisher live) {
        this.topics = topics; this.progress = progress; this.subjects = subjects; this.classes = classes; this.teachers = teachers;
        this.students = students; this.assignments = assignments; this.users = users; this.live = live;
    }

    // ---------------- Teacher ----------------
    @Transactional
    public SyllabusDto addTopic(String username, Long subjectId, AddTopicRequest r) {
        Teacher t = teacherFor(username);
        boolean teachesSubject = assignments.findByTeacherId(t.getId()).stream().anyMatch(ta -> ta.getSubject().getId().equals(subjectId));
        if (!teachesSubject) throw new ApiException(HttpStatus.FORBIDDEN, "You do not teach this subject");
        Subject s = subjects.findById(subjectId).orElseThrow(() -> notFound("Subject not found"));
        int next = topics.findBySubjectIdOrderBySortOrder(subjectId).stream().mapToInt(SyllabusTopic::getSortOrder).max().orElse(0) + 1;
        topics.save(new SyllabusTopic(s, r.unitNo(), r.title().trim(), next));
        // return the syllabus of the first class this teacher teaches this subject in
        ClassGroup cg = assignments.findByTeacherId(t.getId()).stream()
                .filter(ta -> ta.getSubject().getId().equals(subjectId)).map(TeacherAssignment::getClassGroup).findFirst().orElseThrow();
        return build(s, cg);
    }

    @Transactional(readOnly = true)
    public SyllabusDto classSyllabus(String username, Long classId, Long subjectId) {
        requireAssigned(teacherFor(username), subjectId, classId);
        return build(subjects.findById(subjectId).orElseThrow(() -> notFound("Subject not found")),
                classes.findById(classId).orElseThrow(() -> notFound("Class not found")));
    }

    @Transactional
    public SyllabusDto setProgress(String username, Long classId, Long subjectId, Long topicId, boolean completed) {
        Teacher t = teacherFor(username);
        requireAssigned(t, subjectId, classId);
        SyllabusTopic topic = topics.findById(topicId).orElseThrow(() -> notFound("Topic not found"));
        if (!topic.getSubject().getId().equals(subjectId)) throw notFound("Topic not found");
        ClassGroup cg = classes.findById(classId).orElseThrow(() -> notFound("Class not found"));
        SyllabusProgress p = progress.findByTopicIdAndClassGroupId(topicId, classId).orElseGet(() -> new SyllabusProgress(topic, cg));
        p.mark(completed, t);
        progress.save(p);
        String msg = topic.getSubject().getCode() + " syllabus updated: " + topic.getTitle() + (completed ? " completed" : " reopened");
        live.toClass(classId, LiveEvent.of("SYLLABUS_UPDATED", msg));
        live.toHods(LiveEvent.of("SYLLABUS_UPDATED", msg));
        return build(topic.getSubject(), cg);
    }

    // ---------------- Student ----------------
    @Transactional(readOnly = true)
    public List<SyllabusDto> studentSyllabus(String username) {
        User u = users.findByUsernameIgnoreCase(username).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required"));
        Student s = students.findByUserId(u.getId()).orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "Student profile required"));
        ClassGroup cg = s.getClassGroup();
        Map<Long, Subject> distinct = new LinkedHashMap<>();
        for (TeacherAssignment ta : assignments.findByClassGroupId(cg.getId())) distinct.putIfAbsent(ta.getSubject().getId(), ta.getSubject());
        return distinct.values().stream().map(sub -> build(sub, cg)).toList();
    }

    // ---------------- HOD ----------------
    @Transactional(readOnly = true)
    public List<OverviewRowDto> overview() {
        Map<Long, Integer> totalBySubject = new HashMap<>();
        Map<String, Integer> doneByClassSubject = new HashMap<>();
        for (SyllabusTopic t : topics.findAll()) totalBySubject.merge(t.getSubject().getId(), 1, Integer::sum);
        for (SyllabusProgress p : progress.findAll())
            if (p.isCompleted()) doneByClassSubject.merge(p.getClassGroup().getId() + ":" + p.getTopic().getSubject().getId(), 1, Integer::sum);
        List<OverviewRowDto> rows = new ArrayList<>();
        for (TeacherAssignment ta : assignments.findAll()) {
            int total = totalBySubject.getOrDefault(ta.getSubject().getId(), 0);
            int done = doneByClassSubject.getOrDefault(ta.getClassGroup().getId() + ":" + ta.getSubject().getId(), 0);
            rows.add(new OverviewRowDto(ta.getClassGroup().getId(), ta.getClassGroup().getName(), ta.getSubject().getId(),
                    ta.getSubject().getCode(), ta.getSubject().getName(), ta.getTeacher().getUser().getFullName(),
                    total, done, AcademicCalc.percentage(done, total)));
        }
        rows.sort(Comparator.comparing(OverviewRowDto::className).thenComparing(OverviewRowDto::subjectCode));
        return rows;
    }

    // ---------------- helpers ----------------
    private SyllabusDto build(Subject sub, ClassGroup cg) {
        List<SyllabusTopic> list = topics.findBySubjectIdOrderBySortOrder(sub.getId());
        Map<Long, SyllabusProgress> done = progress.findByClassGroupIdAndTopicSubjectId(cg.getId(), sub.getId()).stream()
                .collect(Collectors.toMap(p -> p.getTopic().getId(), p -> p, (a, b) -> a));
        List<TopicDto> dtos = list.stream().map(t -> {
            SyllabusProgress p = done.get(t.getId());
            boolean c = p != null && p.isCompleted();
            return new TopicDto(t.getId(), t.getUnitNo(), t.getTitle(), c, c ? p.getCompletedOn() : null);
        }).toList();
        int doneCount = (int) dtos.stream().filter(TopicDto::completed).count();
        return new SyllabusDto(sub.getId(), sub.getCode(), sub.getName(), cg.getId(), cg.getName(),
                AcademicCalc.percentage(doneCount, dtos.size()), dtos.size(), doneCount, dtos);
    }

    private Teacher teacherFor(String username) {
        User u = users.findByUsernameIgnoreCase(username).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required"));
        return teachers.findByUserId(u.getId()).orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "Teacher profile required"));
    }
    private void requireAssigned(Teacher t, Long subjectId, Long classId) {
        if (!assignments.existsByTeacherIdAndSubjectIdAndClassGroupId(t.getId(), subjectId, classId))
            throw new ApiException(HttpStatus.FORBIDDEN, "You are not assigned to this subject and class");
    }
    private static ApiException notFound(String m) { return new ApiException(HttpStatus.NOT_FOUND, m); }
}
