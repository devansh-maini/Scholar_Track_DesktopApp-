package com.scholartrack.ai;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_chat_history")
public class AiChatMessage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "user_id", nullable = false) private Long userId;
    @Column(name = "session_id", nullable = false, length = 80) private String sessionId;
    @Column(nullable = false, length = 12) private String sender;
    @Column(nullable = false, length = 8000) private String content;
    @Column(name = "created_at", nullable = false, updatable = false) private LocalDateTime createdAt;

    protected AiChatMessage() {}
    public AiChatMessage(Long userId, String sessionId, String sender, String content) {
        this.userId = userId; this.sessionId = sessionId; this.sender = sender; this.content = content;
    }
    @PrePersist void onCreate() { createdAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getSessionId() { return sessionId; }
    public String getSender() { return sender; }
    public String getContent() { return content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
