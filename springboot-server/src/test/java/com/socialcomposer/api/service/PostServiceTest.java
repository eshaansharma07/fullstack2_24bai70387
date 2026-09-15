package com.socialcomposer.api.service;

import com.socialcomposer.api.dto.request.CreatePostRequest;
import com.socialcomposer.api.dto.response.PostResponse;
import com.socialcomposer.api.dto.response.ValidationResultResponse;
import com.socialcomposer.api.entity.Platform;
import com.socialcomposer.api.entity.Post;
import com.socialcomposer.api.exception.PlatformValidationException;
import com.socialcomposer.api.repository.PostRepository;
import com.socialcomposer.api.service.impl.PostServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private ValidationService validationService;

    @InjectMocks
    private PostServiceImpl postService;

    @Test
    @DisplayName("Should successfully create post when validation passes")
    void shouldCreatePostWhenValid() {
        CreatePostRequest request = CreatePostRequest.builder()
                .title("Spring Boot Release")
                .content("Spring Boot 3.2 is awesome!")
                .mediaCount(0)
                .platforms(Set.of(Platform.TWITTER))
                .build();

        when(validationService.validatePost(any())).thenReturn(
                ValidationResultResponse.builder()
                        .overallValid(true)
                        .results(Map.of())
                        .build()
        );

        Post savedPost = Post.builder()
                .id(1L)
                .title(request.getTitle())
                .content(request.getContent())
                .platforms(request.getPlatforms())
                .build();

        when(postRepository.save(any(Post.class))).thenReturn(savedPost);

        PostResponse response = postService.createPost(request);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getTitle()).isEqualTo("Spring Boot Release");
        verify(postRepository, times(1)).save(any(Post.class));
    }

    @Test
    @DisplayName("Should throw PlatformValidationException when platform validation fails")
    void shouldThrowExceptionWhenPlatformValidationFails() {
        CreatePostRequest request = CreatePostRequest.builder()
                .title("Too long for Twitter")
                .content("a".repeat(300)) // exceeds 280
                .platforms(Set.of(Platform.TWITTER))
                .build();

        when(validationService.validatePost(any())).thenReturn(
                ValidationResultResponse.builder()
                        .overallValid(false)
                        .results(Map.of())
                        .build()
        );

        assertThatThrownBy(() -> postService.createPost(request))
                .isInstanceOf(PlatformValidationException.class)
                .hasMessageContaining("Post validation failed");

        verify(postRepository, never()).save(any(Post.class));
    }
}
