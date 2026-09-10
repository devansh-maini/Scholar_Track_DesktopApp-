package com.scholartrack.syllabus;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;

public final class SyllabusDtos {
    private SyllabusDtos() {}
    public record AddTopicRequest(@Min(1) @Max(20) int unitNo, @NotBlank @Size(max = 200) String title) {}
    public record SetProgressRequest(@NotNull Boolean completed) {}
    public record TopicDto(Long id, int unitNo, String title, boolean completed, LocalDate completedOn) {}
    public record SyllabusDto(Long subjectId, String subjectCode, String subjectName, Long classId, String className,
                              double percentComplete, int topicsTotal, int topicsDone, List<TopicDto> topics) {}
    public record OverviewRowDto(Long classId, String className, Long subjectId, String subjectCode, String subjectName,
                                 String teacherName, int topicsTotal, int topicsDone, double percentComplete) {}
}
