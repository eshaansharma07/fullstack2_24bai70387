package com.socialcomposer.api.config;

import com.socialcomposer.api.constants.UserRole;
import com.socialcomposer.api.entity.User;
import com.socialcomposer.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Initializes default user records in the database so that posts and schedules
 * can be linked to creators via foreign key relationships.
 */
@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .name("Admin User")
                    .email("admin@social.com")
                    .password("admin123")
                    .role(UserRole.ADMIN)
                    .build();

            User editor = User.builder()
                    .name("Editor User")
                    .email("editor@social.com")
                    .password("editor123")
                    .role(UserRole.EDITOR)
                    .build();

            User viewer = User.builder()
                    .name("Viewer User")
                    .email("viewer@social.com")
                    .password("viewer123")
                    .role(UserRole.VIEWER)
                    .build();

            userRepository.saveAll(List.of(admin, editor, viewer));
        }
    }
}
