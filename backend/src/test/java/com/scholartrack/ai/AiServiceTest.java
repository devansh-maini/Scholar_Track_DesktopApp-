package com.scholartrack.ai;

import static org.junit.jupiter.api.Assertions.*;

import com.scholartrack.ai.AiDtos.*;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;

class AiServiceTest {

    @Test
    void testChatRequestValidation() {
        assertThrows(IllegalArgumentException.class, () -> new ChatRequest("sess_1", ""));
        assertThrows(IllegalArgumentException.class, () -> new ChatRequest("sess_1", "   "));
        assertThrows(IllegalArgumentException.class, () -> new ChatRequest("sess_1", null));

        ChatRequest valid = new ChatRequest("sess_1", "How do I improve my marks?");
        assertEquals("sess_1", valid.sessionId());
        assertEquals("How do I improve my marks?", valid.message());
    }

    @Test
    void testRiskComponentCalculations() {
        RiskComponent att = new RiskComponent("Attendance", 68.5, 25, 40, 0.25);
        RiskComponent marks = new RiskComponent("Marks", 38.0, 35, 35, 0.35);

        assertEquals("Attendance", att.name());
        assertEquals(25, att.riskPoints());
        assertEquals(40, att.weight());

        RiskPayload payload = new RiskPayload(60.0, "HIGH", List.of(att, marks),
                List.of("Attendance 68.5% below 75%", "Marks 38.0% below 40%"));

        assertEquals("HIGH", payload.level());
        assertEquals(60.0, payload.score());
        assertEquals(2, payload.components().size());
        assertEquals(2, payload.reasons().size());
    }

    @Test
    void testStudyPlanSubjectPriority() {
        StudyPlanSubject sub = new StudyPlanSubject(
                "CS201", "Data Structures", 64.0, 35.0, "HIGH", 6,
                List.of("Attend remaining lectures", "Solve 10 LeetCode problems"));

        assertEquals("CS201", sub.subjectCode());
        assertEquals("HIGH", sub.priority());
        assertEquals(6, sub.weeklyHours());
        assertEquals(2, sub.actions().size());
    }

    @Test
    void testAiChatMessageEntity() {
        AiChatMessage msg = new AiChatMessage(10L, "sess_100", "USER", "Can I get an extension?");
        assertEquals(10L, msg.getUserId());
        assertEquals("sess_100", msg.getSessionId());
        assertEquals("USER", msg.getSender());
        assertEquals("Can I get an extension?", msg.getContent());
    }
}
