package com.socialcomposer.api.controller;

import com.socialcomposer.api.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Demonstrates basic Spring Boot REST Controller matching the fundamental lab tutorial.
 */
@RestController
@Tag(name = "Hello & Health", description = "Basic connectivity and health endpoints")
public class HelloController {

    @GetMapping("/hello")
    @Operation(summary = "Hello endpoint", description = "Returns simple greeting matching Spring Boot fundamentals")
    public String hello() {
        return "Hello from Spring Boot!";
    }

    @GetMapping("/api/v1/health")
    @Operation(summary = "Health check", description = "Returns health status of the Spring Boot backend")
    public ResponseEntity<ApiResponse<Map<String, Object>>> healthCheck() {
        Map<String, Object> health = Map.of(
                "status", "UP",
                "framework", "Spring Boot 3.2.3",
                "javaVersion", System.getProperty("java.version"),
                "environment", "In-Memory H2 DB",
                "service", "SocialComposer API"
        );
        return ResponseEntity.ok(ApiResponse.success(health, "Spring Boot backend is healthy and running."));
    }
}
