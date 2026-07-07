package com.scholartrack.auth;

import com.scholartrack.user.Role;
import jakarta.validation.constraints.NotBlank;

public final class AuthDtos {
    private AuthDtos() {}
    public record LoginRequest(@NotBlank String username, @NotBlank String password) {}
    public record UserDto(Long id, String username, String email, String fullName, Role role) {}
    public record LoginResponse(String token, UserDto user) {}
}
