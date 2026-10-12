package com.scholartrack.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Minimal client for Groq's OpenAI-compatible chat API. The API key lives only here (server side) and is never
 * logged. If the primary model is rejected (e.g. retired by Groq) the fallback model is tried once.
 */
@Component
public class GroqClient {
    private static final Logger log = LoggerFactory.getLogger(GroqClient.class);
    private static final String UNAVAILABLE = "AI service unavailable. Please try again later.";

    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    private final ObjectMapper mapper = new ObjectMapper();
    private final String apiKey;
    private final String baseUrl;
    private final String model;
    private final String fallbackModel;
    private final int timeoutSeconds;

    public GroqClient(@Value("${scholartrack.ai.groq-api-key:}") String apiKey,
                      @Value("${scholartrack.ai.base-url}") String baseUrl,
                      @Value("${scholartrack.ai.model}") String model,
                      @Value("${scholartrack.ai.fallback-model:}") String fallbackModel,
                      @Value("${scholartrack.ai.timeout-seconds:30}") int timeoutSeconds) {
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.model = model; this.fallbackModel = fallbackModel == null ? "" : fallbackModel.trim();
        this.timeoutSeconds = timeoutSeconds;
    }

    public boolean isConfigured() { return !apiKey.isBlank(); }

    private static final class ModelRejected extends RuntimeException {
        ModelRejected(String message) { super(message); }
    }

    public String chat(List<Map<String, String>> messages) {
        if (!isConfigured()) throw new AiUnavailableException("AI service is not configured. Ask the administrator to set GROQ_API_KEY.");
        List<String> models = (fallbackModel.isBlank() || fallbackModel.equals(model)) ? List.of(model) : List.of(model, fallbackModel);
        for (String m : models) {
            try {
                return call(m, messages);
            } catch (ModelRejected e) {
                log.warn("Groq rejected model '{}' ({}).{}", m, e.getMessage(), m.equals(models.get(models.size() - 1)) ? "" : " Trying the fallback model.");
            }
        }
        throw new AiUnavailableException(UNAVAILABLE);
    }

    private String call(String m, List<Map<String, String>> messages) {
        try {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("model", m);
            body.put("messages", messages);
            body.put("temperature", 0.3);
            body.put("max_completion_tokens", 1500);
            if (m.startsWith("openai/gpt-oss")) body.put("reasoning_effort", "low");   // keep reasoning short so the answer fits the budget

            HttpRequest req = HttpRequest.newBuilder(URI.create(baseUrl + "/chat/completions"))
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body)))
                    .build();
            HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
            int sc = res.statusCode();
            if (sc == 400 || sc == 404 || sc == 410) {
                String b = res.body() == null ? "" : res.body();
                throw new ModelRejected("HTTP " + sc + " " + b.substring(0, Math.min(b.length(), 300)));
            }
            if (sc == 401 || sc == 403) {
                log.error("Groq rejected the API key (HTTP {}). Check GROQ_API_KEY.", sc);
                throw new AiUnavailableException(UNAVAILABLE);
            }
            if (sc == 429) throw new AiUnavailableException("AI service is busy right now. Please try again in a minute.");
            if (sc / 100 != 2) {
                log.warn("Groq returned HTTP {}", sc);
                throw new AiUnavailableException(UNAVAILABLE);
            }
            String text = mapper.readTree(res.body()).path("choices").path(0).path("message").path("content").asText("");
            if (text.isBlank()) {
                log.warn("Groq returned an empty answer for model '{}'", m);
                throw new AiUnavailableException(UNAVAILABLE);
            }
            return text.trim();
        } catch (IOException e) {
            log.warn("Groq request failed: {}", e.getClass().getSimpleName());
            throw new AiUnavailableException(UNAVAILABLE);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new AiUnavailableException(UNAVAILABLE);
        }
    }
}
