package com.scholartrack.complaint;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public final class ComplaintDtos {
    private ComplaintDtos() {}
    public record SubmitComplaintRequest(@NotNull ComplaintCategory category, @NotBlank @Size(max = 150) String title,
                                         @NotBlank @Size(max = 2000) String description) {}
    public record AssignRequest(@NotNull Long assigneeUserId) {}
    public record UpdateStatusRequest(@NotNull ComplaintStatus status, @Size(max = 1000) String resolution) {}
    public record ComplaintDto(Long id, ComplaintCategory category, String title, String description, ComplaintStatus status,
                               Long submittedById, String submittedByName, Long assignedToId, String assignedToName,
                               String resolution, LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime resolvedAt) {}
}
