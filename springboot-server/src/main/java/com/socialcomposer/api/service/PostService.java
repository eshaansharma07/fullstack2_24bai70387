package com.socialcomposer.api.service;

import com.socialcomposer.api.dto.request.CreatePostRequest;
import com.socialcomposer.api.dto.request.UpdatePostRequest;
import com.socialcomposer.api.dto.response.PostResponse;

import java.util.List;

public interface PostService {

    PostResponse createPost(CreatePostRequest request);

    List<PostResponse> getAllPosts();

    PostResponse getPostById(Long id);

    PostResponse updatePost(Long id, UpdatePostRequest request);

    void deletePost(Long id);
}
