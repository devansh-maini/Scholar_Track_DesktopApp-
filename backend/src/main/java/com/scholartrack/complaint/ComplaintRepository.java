package com.scholartrack.complaint;

import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    @EntityGraph(attributePaths = {"submittedBy", "assignedTo"})
    List<Complaint> findBySubmittedByIdOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = {"submittedBy", "assignedTo"})
    List<Complaint> findByAssignedToIdOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = {"submittedBy", "assignedTo"})
    List<Complaint> findAllByOrderByCreatedAtDesc();
}
