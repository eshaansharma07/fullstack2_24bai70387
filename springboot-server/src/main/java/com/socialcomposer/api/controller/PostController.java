package com.socialcomposer.api.controller;

import com.socialcomposer.api.dto.request.CreatePostRequest;
import com.socialcomposer.api.dto.request.UpdatePostRequest;
import com.socialcomposer.api.dto.request.ValidatePostRequest;
import com.socialcomposer.api.dto.response.ApiResponse;
import com.socialcomposer.api.dto.response.PostResponse;
import com.socialcomposer.api.dto.response.ValidationResultResponse;
import com.socialcomposer.api.service.PostService;
import com.socialcomposer.api.service.ValidationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
@Tag(name = "Posts API", description = "CRUD and Validation endpoints for social posts with Jakarta Bean Validation")
public class PostController {

    private final PostService postService;
    private final ValidationService validationService;

    @PostMapping
    @Operation(summary = "Create & Publish Post", description = "Validates request via @Valid and saves to H2 database")
    public ResponseEntity<ApiResponse<PostResponse>> createPost(@Valid @RequestBody CreatePostRequest request) {
        PostResponse response = postService.createPost(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Post created and published successfully across platforms."));
    }

    @GetMapping
    @Operation(summary = "Get All Posts", description = "Retrieves all published and draft posts ordered by creation date")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getAllPosts() {
        List<PostResponse> posts = postService.getAllPosts();
        return ResponseEntity.ok(ApiResponse.success(posts, "Retrieved all posts successfully."));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Post By ID", description = "Retrieves specific post by numeric ID")
    public ResponseEntity<ApiResponse<PostResponse>> getPostById(@PathVariable Long id) {
        PostResponse post = postService.getPostById(id);
        return ResponseEntity.ok(ApiResponse.success(post, "Post retrieved successfully."));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Post", description = "Validates and updates an existing post")
    public ResponseEntity<ApiResponse<PostResponse>> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePostRequest request
    ) {
        PostResponse updated = postService.updatePost(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Post updated successfully."));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Post", description = "Deletes post from the database by ID")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Post deleted successfully."));
    }

    @PostMapping("/validate")
    @Operation(summary = "Validate Post Against Social Rules", description = "Validates character limits and media counts across platforms")
    public ResponseEntity<ApiResponse<ValidationResultResponse>> validatePost(@Valid @RequestBody ValidatePostRequest request) {
        ValidationResultResponse result = validationService.validatePost(request);
        return ResponseEntity.ok(ApiResponse.success(result, "Post validation completed."));
    }
}
