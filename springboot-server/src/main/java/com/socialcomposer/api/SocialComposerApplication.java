package com.socialcomposer.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Spring Boot Application Entry Point for SocialComposer REST API.
 * Demonstrates Layered Architecture (Controller, Service, Repository),
 * Bean Validation, Standardized Responses, and Secure CORS Configuration.
 */
@SpringBootApplication
public class SocialComposerApplication {

    public static void main(String[] args) {
        SpringApplication.run(SocialComposerApplication.class, args);
    }
}
