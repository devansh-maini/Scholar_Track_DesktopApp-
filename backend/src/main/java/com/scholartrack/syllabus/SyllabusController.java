package com.scholartrack.syllabus;

import com.scholartrack.common.ApiResponse;
import com.scholartrack.syllabus.SyllabusDtos.*;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class SyllabusController {
    private final SyllabusService svc;
    public SyllabusController(SyllabusService svc) { this.svc = svc; }

    @PostMapping("/teachers/me/subjects/{subjectId}/syllabus") @PreAuthorize("hasRole('TEACHER')") @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SyllabusDto> addTopic(@PathVariable Long subjectId, @Valid @RequestBody AddTopicRequest r, Principal p) {
        return ApiResponse.ok("Topic added", svc.addTopic(p.getName(), subjectId, r));
    }

    @GetMapping("/teachers/me/classes/{classId}/subjects/{subjectId}/syllabus") @PreAuthorize("hasRole('TEACHER')")
    public ApiResponse<SyllabusDto> classSyllabus(@PathVariable Long classId, @PathVariable Long subjectId, Principal p) {
        return ApiResponse.ok("Syllabus", svc.classSyllabus(p.getName(), classId, subjectId));
    }

    @PutMapping("/teachers/me/classes/{classId}/subjects/{subjectId}/syllabus/{topicId}") @PreAuthorize("hasRole('TEACHER')")
    public ApiResponse<SyllabusDto> setProgress(@PathVariable Long classId, @PathVariable Long subjectId, @PathVariable Long topicId,
                                                @Valid @RequestBody SetProgressRequest r, Principal p) {
        return ApiResponse.ok("Syllabus progress saved", svc.setProgress(p.getName(), classId, subjectId, topicId, r.completed()));
    }

    @GetMapping("/students/me/syllabus") @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<List<SyllabusDto>> mySyllabus(Principal p) { return ApiResponse.ok("My syllabus", svc.studentSyllabus(p.getName())); }

    @GetMapping("/hod/syllabus-progress")
    public ApiResponse<List<OverviewRowDto>> overview() { return ApiResponse.ok("Syllabus progress", svc.overview()); }
}
