package com.scholartrack.notice;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

public final class NoticeDtos {
    private NoticeDtos() {}
    public record CreateNoticeRequest(@NotBlank @Size(max = 150) String title, @NotBlank @Size(max = 4000) String description,
                                      @NotNull NoticePriority priority, @NotNull NoticeTarget targetType, Long targetId,
                                      LocalDate expiryDate) {}
    public record NoticeDto(Long id, String title, String description, String authorName, String authorRole,
                            LocalDateTime createdAt, LocalDate expiryDate, boolean expired, NoticePriority priority,
                            NoticeTarget targetType, Long targetId, String targetLabel) {}
}
