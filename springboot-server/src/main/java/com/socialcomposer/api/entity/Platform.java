package com.socialcomposer.api.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Platform {
    TWITTER("twitter", 280, 4, false),
    FACEBOOK("facebook", 63206, 10, false),
    INSTAGRAM("instagram", 2200, 10, true),
    LINKEDIN("linkedin", 3000, 9, false);

    private final String value;
    private final int maxChars;
    private final int maxMedia;
    private final boolean mediaRequired;

    Platform(String value, int maxChars, int maxMedia, boolean mediaRequired) {
        this.value = value;
        this.maxChars = maxChars;
        this.maxMedia = maxMedia;
        this.mediaRequired = mediaRequired;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public int getMaxChars() {
        return maxChars;
    }

    public int getMaxMedia() {
        return maxMedia;
    }

    public boolean isMediaRequired() {
        return mediaRequired;
    }

    @JsonCreator
    public static Platform fromValue(String value) {
        if (value == null) {
            return null;
        }
        for (Platform platform : Platform.values()) {
            if (platform.value.equalsIgnoreCase(value.trim()) || platform.name().equalsIgnoreCase(value.trim())) {
                return platform;
            }
        }
        throw new IllegalArgumentException("Unknown platform: " + value + ". Valid values are: twitter, facebook, instagram, linkedin");
    }
}
