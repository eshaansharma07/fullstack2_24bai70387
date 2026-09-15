package com.socialcomposer.api.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    private String id;
    private String email;
    private String name;
    private String role;
}
