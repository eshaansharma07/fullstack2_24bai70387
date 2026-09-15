package com.socialcomposer.api.dto.request;

import com.socialcomposer.api.entity.Platform;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
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
public class CreateScheduleRequest {

    @NotBlank(message = "Schedule title is required.")
    @Size(min = 3, max = 150, message = "Schedule title must be between 3 and 150 characters.")
    private String title;

    @NotBlank(message = "Schedule post copy is required.")
    @Size(max = 65000, message = "Content cannot exceed 65,000 characters.")
    private String content;

    @Size(max = 10, message = "Maximum 10 media URLs allowed.")
    private List<String> mediaUrls;

    @NotEmpty(message = "At least one target platform must be selected.")
    private Set<Platform> platforms;

    @NotBlank(message = "Scheduled date is required.")
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "Scheduled date must be in ISO format YYYY-MM-DD (e.g. 2026-08-20).")
    private String scheduledDate;

    @NotBlank(message = "Scheduled time is required.")
    @Pattern(regexp = "^([01]?[0-9]|2[0-3]):[0-5][0-9]$", message = "Scheduled time must be in 24-hour HH:mm format (e.g. 14:30).")
    private String scheduledTime;
}
