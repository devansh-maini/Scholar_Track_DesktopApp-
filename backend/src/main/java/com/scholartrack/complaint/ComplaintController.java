package com.scholartrack.complaint;

import com.scholartrack.common.ApiResponse;
import com.scholartrack.complaint.ComplaintDtos.*;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/complaints")
public class ComplaintController {
    private final ComplaintService svc;
    public ComplaintController(ComplaintService svc) { this.svc = svc; }

    @PostMapping @PreAuthorize("hasRole('STUDENT')") @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ComplaintDto> submit(@Valid @RequestBody SubmitComplaintRequest r, Principal p) {
        return ApiResponse.ok("Complaint submitted", svc.submit(p.getName(), r));
    }

    /** Role-scoped: student -> own, teacher -> assigned to me, HOD -> all. */
    @GetMapping
    public ApiResponse<List<ComplaintDto>> list(@RequestParam(required = false) ComplaintStatus status, Principal p) {
        return ApiResponse.ok("Complaints", svc.list(p.getName(), status));
    }

    @PutMapping("/{id}/assign") @PreAuthorize("hasRole('HOD')")
    public ApiResponse<ComplaintDto> assign(@PathVariable Long id, @Valid @RequestBody AssignRequest r, Principal p) {
        return ApiResponse.ok("Complaint assigned", svc.assign(p.getName(), id, r));
    }

    @PutMapping("/{id}/status") @PreAuthorize("hasAnyRole('HOD','TEACHER')")
    public ApiResponse<ComplaintDto> status(@PathVariable Long id, @Valid @RequestBody UpdateStatusRequest r, Principal p) {
        return ApiResponse.ok("Complaint updated", svc.updateStatus(p.getName(), id, r));
    }
}
