package com.scholartrack.auth;

import com.scholartrack.auth.AuthDtos.*;
import com.scholartrack.common.ApiResponse;
import jakarta.validation.Valid;
import java.security.Principal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService auth;
    public AuthController(AuthService auth) { this.auth = auth; }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        return ApiResponse.ok("Login successful", auth.login(req));
    }

    @GetMapping("/me")
    public ApiResponse<UserDto> me(Principal principal) {
        return ApiResponse.ok("Current user", auth.me(principal.getName()));
    }
}
