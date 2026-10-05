package com.socialcomposer.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.socialcomposer.api.constants.Platform;
import com.socialcomposer.api.constants.PostStatus;
import com.socialcomposer.api.dto.request.CreatePostRequest;
import com.socialcomposer.api.dto.response.PostResponse;
import com.socialcomposer.api.service.PostService;
import com.socialcomposer.api.service.ValidationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PostController.class)
class PostControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PostService postService;

    @MockBean
    private ValidationService validationService;

    @Test
    @DisplayName("GET /api/v1/posts should return 200 and list of posts")
    void shouldReturnAllPosts() throws Exception {
        PostResponse post1 = PostResponse.builder()
                .id(1L)
                .title("Launch Day")
                .content("Excited to launch our new product!")
                .mediaCount(0)
                .platforms(Set.of(Platform.TWITTER, Platform.LINKEDIN))
                .status(PostStatus.PUBLISHED)
                .authorName("Admin User")
                .createdAt(LocalDateTime.now())
                .build();

        when(postService.getAllPosts()).thenReturn(List.of(post1));

        mockMvc.perform(get("/api/v1/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].title").value("Launch Day"))
                .andExpect(jsonPath("$.data[0].id").value(1));
    }

    @Test
    @DisplayName("POST /api/v1/posts should create post when validation succeeds")
    void shouldCreatePostSuccessfully() throws Exception {
        CreatePostRequest request = CreatePostRequest.builder()
                .title("Feature Update")
                .content("Check out the new features.")
                .mediaCount(1)
                .platforms(Set.of(Platform.TWITTER))
                .build();

        PostResponse response = PostResponse.builder()
                .id(10L)
                .title(request.getTitle())
                .content(request.getContent())
                .mediaCount(1)
                .platforms(request.getPlatforms())
                .status(PostStatus.PUBLISHED)
                .authorName("Admin User")
                .createdAt(LocalDateTime.now())
                .build();

        when(postService.createPost(any(CreatePostRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(10))
                .andExpect(jsonPath("$.data.title").value("Feature Update"));
    }

    @Test
    @DisplayName("POST /api/v1/posts should return 400 when Bean Validation fails")
    void shouldFailValidationWhenTitleBlank() throws Exception {
        CreatePostRequest invalidRequest = CreatePostRequest.builder()
                .title("") // Blank title triggers @NotBlank
                .content("Valid content")
                .platforms(Set.of(Platform.TWITTER))
                .build();

        mockMvc.perform(post("/api/v1/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors").isArray());
    }
}
