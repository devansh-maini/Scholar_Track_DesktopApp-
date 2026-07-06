package com.scholartrack.auth;

import com.scholartrack.auth.AuthDtos.*;
import com.scholartrack.common.ApiException;
import com.scholartrack.security.JwtService;
import com.scholartrack.user.User;
import com.scholartrack.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users; this.encoder = encoder; this.jwt = jwt;
    }

    public LoginResponse login(LoginRequest req) {
        // Same message for unknown user / wrong password / inactive account: reveals nothing.
        User u = users.findByUsernameIgnoreCaseOrEmailIgnoreCase(req.username(), req.username())
                .filter(x -> x.isActive() && encoder.matches(req.password(), x.getPasswordHash()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid username or password"));
        return new LoginResponse(jwt.generate(u), toDto(u));
    }

    public UserDto me(String username) {
        return users.findByUsernameIgnoreCase(username).map(AuthService::toDto)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required"));
    }

    private static UserDto toDto(User u) {
        return new UserDto(u.getId(), u.getUsername(), u.getEmail(), u.getFullName(), u.getRole());
    }
}
