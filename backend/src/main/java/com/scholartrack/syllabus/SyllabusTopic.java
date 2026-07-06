package com.scholartrack.syllabus;

import com.scholartrack.academic.Subject;
import jakarta.persistence.*;

@Entity
@Table(name = "syllabus_topics")
public class SyllabusTopic {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "subject_id") private Subject subject;
    @Column(name = "unit_no", nullable = false) private int unitNo;
    @Column(nullable = false, length = 200) private String title;
    @Column(name = "sort_order", nullable = false) private int sortOrder;

    protected SyllabusTopic() {}
    public SyllabusTopic(Subject subject, int unitNo, String title, int sortOrder) {
        this.subject = subject; this.unitNo = unitNo; this.title = title; this.sortOrder = sortOrder;
    }
    public Long getId() { return id; }
    public Subject getSubject() { return subject; }
    public int getUnitNo() { return unitNo; }
    public String getTitle() { return title; }
    public int getSortOrder() { return sortOrder; }
}
