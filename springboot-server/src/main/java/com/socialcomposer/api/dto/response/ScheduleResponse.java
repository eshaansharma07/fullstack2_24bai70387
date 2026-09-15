package com.socialcomposer.api.dto.response;

import com.socialcomposer.api.entity.Platform;
import com.socialcomposer.api.entity.PostStatus;
import com.socialcomposer.api.entity.ScheduledPost;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleResponse {

    private Long id;
    private String title;
    private String content;
    private List<String> mediaUrls;
    private Set<Platform> platforms;
    private String scheduledDate;
    private String scheduledTime;
    private PostStatus status;
    private LocalDateTime createdAt;

    public static ScheduleResponse fromEntity(ScheduledPost post) {
        if (post == null) return null;
        return ScheduleResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .mediaUrls(post.getMediaUrls())
                .platforms(post.getPlatforms())
                .scheduledDate(post.getScheduledDate())
                .scheduledTime(post.getScheduledTime())
                .status(post.getStatus())
                .createdAt(post.getCreatedAt())
                .build();
    }
}
