package com.scholartrack.ai;

import com.scholartrack.ai.AiDtos.*;
import com.scholartrack.common.ApiResponse;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

/** Any logged-in role. What the AI can see depends on the caller's role and is decided by the server. */
@RestController
@RequestMapping("/api/v1/ai")
public class AiController {
    private final AiService svc;
    public AiController(AiService svc) { this.svc = svc; }

    @PostMapping("/chat")
    public ApiResponse<AiReplyDto> chat(@Valid @RequestBody ChatRequest r, Principal p) {
        return ApiResponse.ok("AI reply", svc.chat(p.getName(), r.message().trim()));
    }

    @GetMapping("/history")
    public ApiResponse<List<HistoryItemDto>> history(Principal p) { return ApiResponse.ok("AI history", svc.history(p.getName())); }

    @DeleteMapping("/history")
    public ApiResponse<Void> clear(Principal p) {
        svc.clearHistory(p.getName());
        return ApiResponse.ok("AI history cleared", null);
    }

    /** Transparency: shows exactly what data the AI receives for you. Useful for demos and the viva. */
    @GetMapping("/context-preview")
    public ApiResponse<Map<String, String>> preview(Principal p) { return ApiResponse.ok("AI context preview", Map.of("context", svc.contextPreview(p.getName()))); }
}
