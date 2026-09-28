package com.scholartrack.complaint;

import com.scholartrack.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
public class Complaint {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "submitted_by") private User submittedBy;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private ComplaintCategory category;
    @Column(nullable = false, length = 150) private String title;
    @Column(nullable = false, length = 2000) private String description;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 15) private ComplaintStatus status = ComplaintStatus.OPEN;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "assigned_to") private User assignedTo;
    @Column(length = 1000) private String resolution;
    @Column(name = "created_at", nullable = false, updatable = false) private LocalDateTime createdAt;
    @Column(name = "updated_at", nullable = false) private LocalDateTime updatedAt;
    @Column(name = "resolved_at") private LocalDateTime resolvedAt;
    @Version private Long version;

    protected Complaint() {}
    public Complaint(User submittedBy, ComplaintCategory category, String title, String description) {
        this.submittedBy = submittedBy; this.category = category; this.title = title; this.description = description;
    }
    @PrePersist void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate void onUpdate() { updatedAt = LocalDateTime.now(); }

    public boolean isClosed() { return status == ComplaintStatus.RESOLVED || status == ComplaintStatus.REJECTED; }
    public void assignTo(User u) { this.assignedTo = u; if (status == ComplaintStatus.OPEN) status = ComplaintStatus.IN_PROGRESS; }
    public void changeStatus(ComplaintStatus to, String resolution) {
        this.status = to;
        if (to == ComplaintStatus.RESOLVED || to == ComplaintStatus.REJECTED) { this.resolution = resolution; this.resolvedAt = LocalDateTime.now(); }
    }
    /** For seed data only. */
    public void seedState(ComplaintStatus s, User assignee, String resolution) {
        this.status = s; this.assignedTo = assignee; this.resolution = resolution;
        if (isClosed()) this.resolvedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public User getSubmittedBy() { return submittedBy; }
    public ComplaintCategory getCategory() { return category; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public ComplaintStatus getStatus() { return status; }
    public User getAssignedTo() { return assignedTo; }
    public String getResolution() { return resolution; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
}
