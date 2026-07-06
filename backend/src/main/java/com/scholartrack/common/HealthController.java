package com.scholartrack.common;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Public endpoint used by the desktop app ("waking up server") and uptime pingers. */
@RestController
public class HealthController {
    @GetMapping("/api/v1/health")
    public ApiResponse<Map<String, String>> health() {
        return ApiResponse.ok("ScholarTrack is running", Map.of("status", "UP"));
    }
}
