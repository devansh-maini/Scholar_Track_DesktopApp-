package com.scholartrack.live;

import com.scholartrack.security.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import java.util.List;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

/**
 * Security for the WebSocket channel:
 *  - CONNECT must carry a valid "Authorization: Bearer <jwt>" STOMP header
 *  - clients may only SUBSCRIBE to their own private queue (/user/queue/...)
 *  - clients may not SEND messages (the server is the only publisher)
 */
@Component
public class StompAuthInterceptor implements ChannelInterceptor {
    private final JwtService jwt;
    public StompAuthInterceptor(JwtService jwt) { this.jwt = jwt; }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor acc = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (acc == null || acc.getCommand() == null) return message;

        if (StompCommand.CONNECT.equals(acc.getCommand())) {
            String header = acc.getFirstNativeHeader("Authorization");
            if (header == null || !header.startsWith("Bearer ")) throw new MessagingException("Unauthorized");
            try {
                Claims c = jwt.parse(header.substring(7));
                acc.setUser(new UsernamePasswordAuthenticationToken(c.getSubject(), null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + c.get("role", String.class)))));
            } catch (JwtException | IllegalArgumentException e) {
                throw new MessagingException("Unauthorized");
            }
        } else if (StompCommand.SUBSCRIBE.equals(acc.getCommand())) {
            String dest = acc.getDestination();
            if (dest == null || !dest.startsWith("/user/queue/")) throw new MessagingException("Forbidden destination");
        } else if (StompCommand.SEND.equals(acc.getCommand())) {
            throw new MessagingException("Sending is not allowed");
        }
        return message;
    }
}
