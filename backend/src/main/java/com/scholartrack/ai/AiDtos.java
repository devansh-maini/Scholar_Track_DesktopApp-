package com.scholartrack.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public final class AiDtos {
    private AiDtos() {}
    public record ChatRequest(@NotBlank @Size(max = 1000) String message) {}
    public record AiReplyDto(String reply, LocalDateTime at) {}
    public record HistoryItemDto(Long id, String sender, String content, LocalDateTime at) {}
}
