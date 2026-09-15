package com.socialcomposer.api.service;

import com.socialcomposer.api.dto.request.ValidatePostRequest;
import com.socialcomposer.api.dto.response.ValidationResultResponse;

public interface ValidationService {

    ValidationResultResponse validatePost(ValidatePostRequest request);
}
