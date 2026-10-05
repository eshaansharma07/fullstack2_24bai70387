package com.socialcomposer.api.dto.response;

import com.socialcomposer.api.constants.Platform;
import com.socialcomposer.api.constants.PostStatus;
import com.socialcomposer.api.entity.Post;
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

    // Foreign key author details
    private Long authorId;
    private String authorName;
    private String authorEmail;
    private String authorRole;

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
                .authorId(post.getAuthor() != null ? post.getAuthor().getId() : null)
                .authorName(post.getAuthor() != null ? post.getAuthor().getName() : "Anonymous")
                .authorEmail(post.getAuthor() != null ? post.getAuthor().getEmail() : null)
                .authorRole(post.getAuthor() != null && post.getAuthor().getRole() != null ? post.getAuthor().getRole().name() : null)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
