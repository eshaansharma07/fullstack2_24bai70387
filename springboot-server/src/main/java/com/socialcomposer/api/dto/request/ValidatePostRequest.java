package com.socialcomposer.api.dto.request;

import com.socialcomposer.api.constants.Platform;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidatePostRequest {

    private String content;

    private int mediaCount;

    @NotEmpty(message = "At least one target platform is required for validation.")
    private Set<Platform> platforms;
}
