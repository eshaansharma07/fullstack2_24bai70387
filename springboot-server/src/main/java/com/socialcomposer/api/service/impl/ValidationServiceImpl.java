package com.socialcomposer.api.service.impl;

import com.socialcomposer.api.dto.request.ValidatePostRequest;
import com.socialcomposer.api.dto.response.ValidationResultResponse;
import com.socialcomposer.api.dto.response.ValidationResultResponse.PlatformValidationDetail;
import com.socialcomposer.api.entity.Platform;
import com.socialcomposer.api.service.ValidationService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ValidationServiceImpl implements ValidationService {

    @Override
    public ValidationResultResponse validatePost(ValidatePostRequest request) {
        String content = request.getContent() != null ? request.getContent() : "";
        int mediaCount = request.getMediaCount();
        int charCount = content.length();

        Map<String, PlatformValidationDetail> results = new HashMap<>();
        boolean overallValid = true;

        if (request.getPlatforms() != null) {
            for (Platform platform : request.getPlatforms()) {
                PlatformValidationDetail detail = validateSinglePlatform(platform, content, charCount, mediaCount);
                results.put(platform.getValue(), detail);
                if (!detail.isValid()) {
                    overallValid = false;
                }
            }
        }

        return ValidationResultResponse.builder()
                .overallValid(overallValid)
                .results(results)
                .build();
    }

    private PlatformValidationDetail validateSinglePlatform(Platform platform, String content, int charCount, int mediaCount) {
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        // 1. Character Limit Check
        if (charCount > platform.getMaxChars()) {
            errors.add(String.format("Content length (%d) exceeds %s limit of %d characters.",
                    charCount, platform.name(), platform.getMaxChars()));
        }

        // 2. Media Count Limit Check
        if (mediaCount > platform.getMaxMedia()) {
            errors.add(String.format("Media count (%d) exceeds %s maximum allowed (%d).",
                    mediaCount, platform.name(), platform.getMaxMedia()));
        }

        // 3. Mandatory Media Check (e.g. Instagram)
        if (platform.isMediaRequired() && mediaCount <= 0) {
            errors.add(String.format("%s requires at least one image or media attachment.", platform.name()));
        }

        // 4. Platform-specific Warnings
        if (platform == Platform.TWITTER && charCount > 240 && charCount <= 280) {
            warnings.add("Approaching 280 character limit on X (Twitter).");
        }

        if (platform == Platform.INSTAGRAM && !content.contains("#")) {
            warnings.add("Adding hashtags can increase reach on Instagram.");
        }

        if (platform == Platform.LINKEDIN && charCount > 0 && charCount < 50) {
            warnings.add("LinkedIn posts perform better with descriptive content (> 50 characters).");
        }

        return PlatformValidationDetail.builder()
                .isValid(errors.isEmpty())
                .errors(errors)
                .warnings(warnings)
                .charCount(charCount)
                .maxChars(platform.getMaxChars())
                .mediaCount(mediaCount)
                .maxMedia(platform.getMaxMedia())
                .build();
    }
}
