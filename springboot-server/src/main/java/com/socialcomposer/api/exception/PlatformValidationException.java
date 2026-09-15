package com.socialcomposer.api.exception;

import com.socialcomposer.api.dto.response.ValidationResultResponse;
import lombok.Getter;

@Getter
public class PlatformValidationException extends RuntimeException {

    private final ValidationResultResponse validationResult;

    public PlatformValidationException(String message, ValidationResultResponse validationResult) {
        super(message);
        this.validationResult = validationResult;
    }
}
