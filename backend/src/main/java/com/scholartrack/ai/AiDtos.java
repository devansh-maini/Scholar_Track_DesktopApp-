package com.scholartrack.ai;

import java.time.LocalDateTime;
import java.util.List;

/** DTOs for AI assistant endpoints. */
public final class AiDtos {
    private AiDtos() {}

    // ── Chat ──────────────────────────────────────────────────────────────────

    public record ChatRequest(
            String sessionId,
            String message) {
        public ChatRequest {
            if (message == null || message.isBlank()) throw new IllegalArgumentException("message is required");
            if (message.length() > 4000) throw new IllegalArgumentException("message too long (max 4000 chars)");
        }
    }

    public record ChatReply(String reply, String sessionId, LocalDateTime at) {}

    public record HistoryItem(Long id, String sender, String content, LocalDateTime at) {}

    // ── Academic risk ─────────────────────────────────────────────────────────

    public record RiskComponent(String name, Double value, int riskPoints, int weight, double contribution) {}

    public record RiskDetail(
            Long studentId,
            String rollNo,
            String fullName,
            RiskPayload risk) {}

    public record RiskPayload(
            double score,
            String level,
            List<RiskComponent> components,
            List<String> reasons) {}

    // ── Study plan ───────────────────────────────────────────────────────────

    public record StudyPlanSubject(
            String subjectCode,
            String subjectName,
            double attendancePct,
            double marksPct,
            String priority,
            int weeklyHours,
            List<String> actions) {}

    public record StudyPlanDto(
            String studentName,
            String rollNo,
            String generatedAt,
            List<StudyPlanSubject> subjects,
            List<String> generalAdvice) {}
}
