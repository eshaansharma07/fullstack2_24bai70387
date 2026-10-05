package com.socialcomposer.api.entity;

import com.socialcomposer.api.constants.Platform;
import com.socialcomposer.api.constants.PostStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "scheduled_posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduledPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 65000)
    private String content;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "scheduled_post_media_urls", joinColumns = @JoinColumn(name = "scheduled_post_id"))
    @Column(name = "media_url", length = 1000)
    @Builder.Default
    private List<String> mediaUrls = new ArrayList<>();

    @ElementCollection(targetClass = Platform.class, fetch = FetchType.EAGER)
    @CollectionTable(name = "scheduled_post_platforms", joinColumns = @JoinColumn(name = "scheduled_post_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "platform", nullable = false)
    @Builder.Default
    private Set<Platform> platforms = new HashSet<>();

    @Column(name = "scheduled_date", nullable = false, length = 10)
    private String scheduledDate; // Format: YYYY-MM-DD

    @Column(name = "scheduled_time", nullable = false, length = 5)
    private String scheduledTime; // Format: HH:mm

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PostStatus status = PostStatus.SCHEDULED;

    /**
     * Foreign key constraint linking scheduled post to its creator/author.
     * Maps to column `user_id` referencing `users(id)`.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User author;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
