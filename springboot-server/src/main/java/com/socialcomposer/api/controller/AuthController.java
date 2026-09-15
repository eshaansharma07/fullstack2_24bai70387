package com.socialcomposer.api.controller;

import com.socialcomposer.api.dto.request.AuthLoginRequest;
import com.socialcomposer.api.dto.response.ApiResponse;
import com.socialcomposer.api.dto.response.AuthResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Auth API", description = "Authentication & JWT simulation endpoints")
public class AuthController {

    private static final Map<String, AuthUserRecord> USERS = Map.of(
            "admin@social.com", new AuthUserRecord("usr_admin_001", "Admin User", "admin123", "admin"),
            "editor@social.com", new AuthUserRecord("usr_editor_001", "Editor User", "editor123", "editor"),
            "viewer@social.com", new AuthUserRecord("usr_viewer_001", "Viewer User", "viewer123", "viewer")
    );

    @PostMapping("/login")
    @Operation(summary = "User Login", description = "Validates credentials and returns JWT token and user info")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthLoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        AuthUserRecord user = USERS.get(email);

        if (user == null || !user.password().equals(request.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid email or password.", HttpStatus.UNAUTHORIZED));
        }

        String mockToken = "sb_jwt_" + user.role() + "_" + System.currentTimeMillis();
        AuthResponse response = AuthResponse.builder()
                .token(mockToken)
                .id(user.id())
                .email(email)
                .name(user.name())
                .role(user.role())
                .build();

        return ResponseEntity.ok(ApiResponse.success(response, "Login successful. Welcome back, " + user.name()));
    }

    private record AuthUserRecord(String id, String name, String password, String role) {}
}
