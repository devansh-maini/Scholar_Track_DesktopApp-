package com.scholartrack.live;

import com.scholartrack.academic.StudentRepository;
import com.scholartrack.user.Role;
import com.scholartrack.user.User;
import com.scholartrack.user.UserRepository;
import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * Sends live events only to users the server chooses (private per-user queue), and only AFTER the database
 * transaction commits, so a client never reacts to data that is not yet visible.
 */
@Component
public class LiveEventPublisher {
    private static final Logger log = LoggerFactory.getLogger(LiveEventPublisher.class);
    private final SimpMessagingTemplate template;
    private final UserRepository users;
    private final StudentRepository students;

    public LiveEventPublisher(SimpMessagingTemplate template, UserRepository users, StudentRepository students) {
        this.template = template; this.users = users; this.students = students;
    }

    public void toUser(String username, LiveEvent event) { toUsers(List.of(username), event); }

    public void toUsers(Collection<String> usernames, LiveEvent event) {
        List<String> targets = new ArrayList<>(new LinkedHashSet<>(usernames));
        if (targets.isEmpty()) return;
        afterCommit(() -> {
            for (String u : targets) {
                try { template.convertAndSendToUser(u, "/queue/events", event); }
                catch (Exception e) { log.warn("Live event to {} failed: {}", u, e.getMessage()); }
            }
        });
    }

    public void toHods(LiveEvent event) {
        toUsers(users.findByRoleAndActiveTrue(Role.HOD).stream().map(User::getUsername).toList(), event);
    }

    public void toClass(Long classId, LiveEvent event) {
        toUsers(students.findByClassGroupIdOrderByRollNo(classId).stream().map(s -> s.getUser().getUsername()).toList(), event);
    }

    private void afterCommit(Runnable r) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override public void afterCommit() { r.run(); }
            });
        } else {
            r.run();
        }
    }
}
