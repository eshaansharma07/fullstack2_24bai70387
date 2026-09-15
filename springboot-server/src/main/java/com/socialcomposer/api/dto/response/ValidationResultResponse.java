package com.socialcomposer.api.dto.response;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidationResultResponse {

    private boolean overallValid;
    private Map<String, PlatformValidationDetail> results;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PlatformValidationDetail {
        private boolean isValid;
        private List<String> errors;
        private List<String> warnings;
        private int charCount;
        private int maxChars;
        private int mediaCount;
        private int maxMedia;
    }
}
