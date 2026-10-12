package com.scholartrack.ai;

import com.scholartrack.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_messages")
public class AiMessage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id") private User user;
    @Column(nullable = false, length = 10) private String sender;      // USER or ASSISTANT
    @Column(nullable = false, length = 8000) private String content;
    @Column(name = "created_at", nullable = false, updatable = false) private LocalDateTime createdAt;

    protected AiMessage() {}
    public AiMessage(User user, String sender, String content) { this.user = user; this.sender = sender; this.content = content; }
    @PrePersist void onCreate() { createdAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public String getSender() { return sender; }
    public String getContent() { return content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
