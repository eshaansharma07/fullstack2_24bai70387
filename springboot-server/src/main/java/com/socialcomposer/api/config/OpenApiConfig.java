package com.socialcomposer.api.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI socialComposerOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SocialComposer Spring Boot REST API")
                        .description("RESTful Backend Service for SocialComposer. Built with Spring Boot 3.2, Spring Data JPA, Jakarta Bean Validation, and Swagger UI.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("SocialComposer Dev Team")
                                .email("dev@socialcomposer.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Spring Boot Development Server"),
                        new Server().url("https://fullstack2-postcomposer.vercel.app").description("Production Gateway")
                ));
    }
}
