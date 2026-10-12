package com.scholartrack.ai;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiMessageRepository extends JpaRepository<AiMessage, Long> {
    List<AiMessage> findTop6ByUserIdOrderByCreatedAtDesc(Long userId);
    List<AiMessage> findTop20ByUserIdOrderByCreatedAtDesc(Long userId);
    void deleteByUserId(Long userId);
}
