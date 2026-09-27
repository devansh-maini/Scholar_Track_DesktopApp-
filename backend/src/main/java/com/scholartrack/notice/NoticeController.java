package com.scholartrack.notice;

import com.scholartrack.common.ApiResponse;
import com.scholartrack.notice.NoticeDtos.*;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notices")
public class NoticeController {
    private final NoticeService svc;
    public NoticeController(NoticeService svc) { this.svc = svc; }

    @GetMapping
    public ApiResponse<List<NoticeDto>> list(@RequestParam(defaultValue = "false") boolean includeExpired, Principal p) {
        return ApiResponse.ok("Notices", svc.visible(p.getName(), includeExpired));
    }

    @PostMapping @PreAuthorize("hasAnyRole('HOD','TEACHER')") @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<NoticeDto> create(@Valid @RequestBody CreateNoticeRequest r, Principal p) {
        return ApiResponse.ok("Notice published", svc.create(p.getName(), r));
    }

    @DeleteMapping("/{id}") @PreAuthorize("hasAnyRole('HOD','TEACHER')")
    public ApiResponse<Void> delete(@PathVariable Long id, Principal p) {
        svc.delete(p.getName(), id);
        return ApiResponse.ok("Notice deleted", null);
    }
}
