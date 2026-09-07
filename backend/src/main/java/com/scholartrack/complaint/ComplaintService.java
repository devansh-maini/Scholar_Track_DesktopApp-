package com.scholartrack.complaint;

import com.scholartrack.common.ApiException;
import com.scholartrack.complaint.ComplaintDtos.*;
import com.scholartrack.live.LiveEvent;
import com.scholartrack.live.LiveEventPublisher;
import com.scholartrack.user.Role;
import com.scholartrack.user.User;
import com.scholartrack.user.UserRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Workflow: OPEN -> (HOD assigns a handler) IN_PROGRESS -> RESOLVED | REJECTED (needs a resolution note). Closed is final.
 * Students see their own complaints, teachers see complaints assigned to them, the HOD sees everything.
 */
@Service
public class ComplaintService {
    private final ComplaintRepository complaints;
    private final UserRepository users;
    private final LiveEventPublisher live;

    public ComplaintService(ComplaintRepository complaints, UserRepository users, LiveEventPublisher live) {
        this.complaints = complaints; this.users = users; this.live = live;
    }

    @Transactional
    public ComplaintDto submit(String username, SubmitComplaintRequest r) {
        User u = user(username);
        Complaint c = complaints.save(new Complaint(u, r.category(), r.title().trim(), r.description().trim()));
        live.toHods(LiveEvent.of("COMPLAINT_UPDATED", "New complaint: " + c.getTitle()));
        return toDto(c);
    }

    @Transactional(readOnly = true)
    public List<ComplaintDto> list(String username, ComplaintStatus status) {
        User u = user(username);
        List<Complaint> list = switch (u.getRole()) {
            case STUDENT -> complaints.findBySubmittedByIdOrderByCreatedAtDesc(u.getId());
            case TEACHER -> complaints.findByAssignedToIdOrderByCreatedAtDesc(u.getId());
            case HOD -> complaints.findAllByOrderByCreatedAtDesc();
        };
        return list.stream().filter(c -> status == null || c.getStatus() == status).map(c -> toDto(c)).toList();
    }

    @Transactional
    public ComplaintDto assign(String username, Long id, AssignRequest r) {
        Complaint c = find(id);
        if (c.isClosed()) throw new ApiException(HttpStatus.CONFLICT, "This complaint is already closed");
        User assignee = users.findById(r.assigneeUserId())
                .filter(a -> a.isActive() && (a.getRole() == Role.TEACHER || a.getRole() == Role.HOD))
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Assignee must be an active teacher or HOD"));
        c.assignTo(assignee);
        complaints.save(c);
        live.toUsers(List.of(assignee.getUsername(), c.getSubmittedBy().getUsername()),
                LiveEvent.of("COMPLAINT_UPDATED", "Complaint assigned: " + c.getTitle()));
        return toDto(c);
    }

    @Transactional
    public ComplaintDto updateStatus(String username, Long id, UpdateStatusRequest r) {
        User u = user(username);
        Complaint c = find(id);
        boolean isHod = u.getRole() == Role.HOD;
        boolean isAssignee = c.getAssignedTo() != null && c.getAssignedTo().getId().equals(u.getId());
        if (!isHod && !isAssignee) throw new ApiException(HttpStatus.FORBIDDEN, "You are not the handler of this complaint");
        if (c.isClosed()) throw new ApiException(HttpStatus.CONFLICT, "This complaint is already closed");
        if (r.status() == ComplaintStatus.OPEN) throw new ApiException(HttpStatus.BAD_REQUEST, "A complaint cannot be moved back to OPEN");
        boolean closing = r.status() == ComplaintStatus.RESOLVED || r.status() == ComplaintStatus.REJECTED;
        if (closing && (r.resolution() == null || r.resolution().isBlank()))
            throw new ApiException(HttpStatus.BAD_REQUEST, "A resolution note is required to close a complaint");
        c.changeStatus(r.status(), closing ? r.resolution().trim() : null);
        complaints.save(c);
        live.toUsers(List.of(c.getSubmittedBy().getUsername()), LiveEvent.of("COMPLAINT_UPDATED", "Your complaint is now " + c.getStatus() + ": " + c.getTitle()));
        live.toHods(LiveEvent.of("COMPLAINT_UPDATED", "Complaint " + c.getStatus() + ": " + c.getTitle()));
        return toDto(c);
    }

    private Complaint find(Long id) {
        return complaints.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Complaint not found"));
    }
    private User user(String username) {
        return users.findByUsernameIgnoreCase(username).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required"));
    }
    private static ComplaintDto toDto(Complaint c) {
        User a = c.getAssignedTo();
        return new ComplaintDto(c.getId(), c.getCategory(), c.getTitle(), c.getDescription(), c.getStatus(),
                c.getSubmittedBy().getId(), c.getSubmittedBy().getFullName(), a == null ? null : a.getId(), a == null ? null : a.getFullName(),
                c.getResolution(), c.getCreatedAt(), c.getUpdatedAt(), c.getResolvedAt());
    }
}
