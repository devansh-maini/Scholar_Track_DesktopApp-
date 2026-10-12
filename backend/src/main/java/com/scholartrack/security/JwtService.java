package com.scholartrack.security;

import com.scholartrack.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private final SecretKey key;
    private final long expiryMs;

    public JwtService(@Value("${scholartrack.jwt.secret}") String secret,
                      @Value("${scholartrack.jwt.expiry-minutes}") long expiryMinutes) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)); // secret must be >= 32 chars
        this.expiryMs = expiryMinutes * 60_000L;
    }

    public String generate(User u) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .subject(u.getUsername())
                .claim("uid", u.getId())
                .claim("role", u.getRole().name())
                .issuedAt(new Date(now))
                .expiration(new Date(now + expiryMs))
                .signWith(key)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }
}
