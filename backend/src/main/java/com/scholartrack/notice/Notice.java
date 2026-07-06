package com.scholartrack.notice;

import com.scholartrack.user.User;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "notices")
public class Notice {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 150) private String title;
    @Column(nullable = false, length = 4000) private String description;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "author_id") private User author;
    @Column(name = "created_at", nullable = false, updatable = false) private LocalDateTime createdAt;
    @Column(name = "expiry_date") private LocalDate expiryDate;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 12) private NoticePriority priority;
    @Enumerated(EnumType.STRING) @Column(name = "target_type", nullable = false, length = 15) private NoticeTarget targetType;
    @Column(name = "target_id") private Long targetId;

    protected Notice() {}
    public Notice(User author, String title, String description, LocalDate expiryDate, NoticePriority priority,
                  NoticeTarget targetType, Long targetId) {
        this.author = author; this.title = title; this.description = description; this.expiryDate = expiryDate;
        this.priority = priority; this.targetType = targetType; this.targetId = targetId;
    }
    @PrePersist void onCreate() { if (createdAt == null) createdAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public User getAuthor() { return author; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public NoticePriority getPriority() { return priority; }
    public NoticeTarget getTargetType() { return targetType; }
    public Long getTargetId() { return targetId; }
}
