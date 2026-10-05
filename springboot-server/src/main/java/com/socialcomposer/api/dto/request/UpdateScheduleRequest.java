package com.socialcomposer.api.dto.request;

import com.socialcomposer.api.constants.Platform;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateScheduleRequest {

    @Size(min = 3, max = 150, message = "Schedule title must be between 3 and 150 characters.")
    private String title;

    @Size(max = 65000, message = "Content cannot exceed 65,000 characters.")
    private String content;

    private List<String> mediaUrls;

    private Set<Platform> platforms;

    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "Scheduled date must be in ISO format YYYY-MM-DD.")
    private String scheduledDate;

    @Pattern(regexp = "^([01]?[0-9]|2[0-3]):[0-5][0-9]$", message = "Scheduled time must be in 24-hour HH:mm format.")
    private String scheduledTime;
}
