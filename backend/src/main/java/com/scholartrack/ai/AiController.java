package com.scholartrack.ai;

import com.scholartrack.ai.AiDtos.*;
import com.scholartrack.common.ApiResponse;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * AI assistant REST endpoints.
 * Secured – requires authentication. Role-based visibility is enforced in the service layer.
 */
@RestController
@RequestMapping("/api/v1/ai")
public class AiController {

    private final AiService svc;

    public AiController(AiService svc) { this.svc = svc; }

    // ── Academic risk ─────────────────────────────────────────────────────────

    /** My own academic risk assessment (student calling on their own behalf). */
    @GetMapping("/risk/me") @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<RiskDetail> myRisk(Principal p) {
        return ApiResponse.ok("Academic risk analysis", svc.studentRisk(p.getName()));
    }

    /** HOD/Teacher can look up any student's risk. */
    @GetMapping("/risk/students/{studentId}") @PreAuthorize("hasAnyRole('HOD','TEACHER')")
    public ApiResponse<RiskDetail> studentRisk(@PathVariable Long studentId) {
        return ApiResponse.ok("Student academic risk", svc.studentRiskById(studentId));
    }

    // ── Study plan ───────────────────────────────────────────────────────────

    /** Generate a personalised study plan for the authenticated student. */
    @GetMapping("/study-plan") @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<StudyPlanDto> studyPlan(Principal p) {
        return ApiResponse.ok("Study plan generated", svc.generateStudyPlan(p.getName()));
    }

    // ── Chat ──────────────────────────────────────────────────────────────────

    /** Send a message to the AI assistant; reply is persisted and returned. */
    @PostMapping("/chat")
    public ApiResponse<ChatReply> chat(@RequestBody ChatRequest req, Principal p) {
        // Validate here since record constructor validation isn't @Valid compatible
        if (req == null || req.message() == null || req.message().isBlank())
            return ApiResponse.error("message is required");
        if (req.message().length() > 4000)
            return ApiResponse.error("message too long (max 4000 characters)");
        return ApiResponse.ok("Reply", svc.chat(p.getName(), req));
    }

    /** Retrieve full conversation history for the authenticated user. */
    @GetMapping("/chat/history")
    public ApiResponse<List<HistoryItem>> history(Principal p) {
        return ApiResponse.ok("Chat history", svc.chatHistory(p.getName()));
    }

    /** Clear chat history (optionally for a single session). */
    @DeleteMapping("/chat/history")
    public ApiResponse<Void> clearHistory(@RequestParam(required = false) String sessionId, Principal p) {
        svc.clearHistory(p.getName(), sessionId);
        return ApiResponse.ok("History cleared", null);
    }
}
