package com.socialcomposer.api.service.impl;

import com.socialcomposer.api.constants.Platform;
import com.socialcomposer.api.constants.PostStatus;
import com.socialcomposer.api.dto.request.CreatePostRequest;
import com.socialcomposer.api.dto.request.UpdatePostRequest;
import com.socialcomposer.api.dto.request.ValidatePostRequest;
import com.socialcomposer.api.dto.response.PostResponse;
import com.socialcomposer.api.dto.response.ValidationResultResponse;
import com.socialcomposer.api.entity.Post;
import com.socialcomposer.api.entity.User;
import com.socialcomposer.api.exception.PlatformValidationException;
import com.socialcomposer.api.exception.ResourceNotFoundException;
import com.socialcomposer.api.repository.PostRepository;
import com.socialcomposer.api.repository.UserRepository;
import com.socialcomposer.api.service.PostService;
import com.socialcomposer.api.service.ValidationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final ValidationService validationService;

    @Override
    @Transactional
    public PostResponse createPost(CreatePostRequest request) {
        int mediaCount = request.getMediaUrls() != null ? request.getMediaUrls().size() : request.getMediaCount();
        ValidationResultResponse validation = validationService.validatePost(
                ValidatePostRequest.builder()
                        .content(request.getContent())
                        .mediaCount(mediaCount)
                        .platforms(request.getPlatforms())
                        .build()
        );

        if (!validation.isOverallValid()) {
            throw new PlatformValidationException("Post validation failed for one or more selected platforms.", validation);
        }

        // Resolve author entity for foreign key relationship
        User author = null;
        if (request.getUserId() != null) {
            author = userRepository.findById(request.getUserId()).orElse(null);
        } else if (request.getUserEmail() != null && !request.getUserEmail().isBlank()) {
            author = userRepository.findByEmail(request.getUserEmail().trim().toLowerCase()).orElse(null);
        }

        if (author == null) {
            // Default to first available user (e.g. admin) if none specified
            author = userRepository.findAll().stream().findFirst().orElse(null);
        }

        Post post = Post.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .mediaCount(mediaCount)
                .mediaUrls(request.getMediaUrls() != null ? request.getMediaUrls() : new ArrayList<>())
                .platforms(request.getPlatforms())
                .status(PostStatus.PUBLISHED)
                .author(author)
                .build();

        Post savedPost = postRepository.save(post);
        return PostResponse.fromEntity(savedPost);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponse> getAllPosts() {
        return postRepository.findByOrderByCreatedAtDesc().stream()
                .map(PostResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PostResponse getPostById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post", id));
        return PostResponse.fromEntity(post);
    }

    @Override
    @Transactional
    public PostResponse updatePost(Long id, UpdatePostRequest request) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post", id));

        int mediaCount = request.getMediaUrls() != null ? request.getMediaUrls().size() : request.getMediaCount();
        ValidationResultResponse validation = validationService.validatePost(
                ValidatePostRequest.builder()
                        .content(request.getContent())
                        .mediaCount(mediaCount)
                        .platforms(request.getPlatforms())
                        .build()
        );

        if (!validation.isOverallValid()) {
            throw new PlatformValidationException("Updated post validation failed for one or more platforms.", validation);
        }

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setMediaCount(mediaCount);
        if (request.getMediaUrls() != null) {
            post.setMediaUrls(request.getMediaUrls());
        }
        if (request.getPlatforms() != null) {
            post.setPlatforms(request.getPlatforms());
        }

        Post updatedPost = postRepository.save(post);
        return PostResponse.fromEntity(updatedPost);
    }

    @Override
    @Transactional
    public void deletePost(Long id) {
        if (!postRepository.existsById(id)) {
            throw new ResourceNotFoundException("Post", id);
        }
        postRepository.deleteById(id);
    }
}
