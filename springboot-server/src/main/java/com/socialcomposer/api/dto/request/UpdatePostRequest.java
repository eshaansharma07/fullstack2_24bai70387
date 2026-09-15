package com.socialcomposer.api.dto.request;

import com.socialcomposer.api.entity.Platform;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdatePostRequest {

    @NotBlank(message = "Post title is required.")
    @Size(min = 3, max = 150, message = "Post title must be between 3 and 150 characters.")
    private String title;

    @NotBlank(message = "Post content is required.")
    @Size(max = 65000, message = "Content cannot exceed 65,000 characters.")
    private String content;

    private int mediaCount;

    @Size(max = 10, message = "A maximum of 10 media URLs can be attached.")
    private List<String> mediaUrls;

    @NotEmpty(message = "At least one platform must be selected.")
    private Set<Platform> platforms;
}
