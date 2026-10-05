package com.socialcomposer.api.repository;

import com.socialcomposer.api.constants.Platform;
import com.socialcomposer.api.constants.PostStatus;
import com.socialcomposer.api.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findByOrderByCreatedAtDesc();

    List<Post> findByStatusOrderByCreatedAtDesc(PostStatus status);

    List<Post> findByPlatformsContaining(Platform platform);

    List<Post> findByAuthorIdOrderByCreatedAtDesc(Long authorId);
}
