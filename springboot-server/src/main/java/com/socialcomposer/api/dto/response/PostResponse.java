package com.socialcomposer.api.dto.response;

import com.socialcomposer.api.entity.Platform;
import com.socialcomposer.api.entity.Post;
import com.socialcomposer.api.entity.PostStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostResponse {

    private Long id;
    private String title;
    private String content;
    private int mediaCount;
    private List<String> mediaUrls;
    private Set<Platform> platforms;
    private PostStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PostResponse fromEntity(Post post) {
        if (post == null) return null;
        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .mediaCount(post.getMediaCount())
                .mediaUrls(post.getMediaUrls())
                .platforms(post.getPlatforms())
                .status(post.getStatus())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
