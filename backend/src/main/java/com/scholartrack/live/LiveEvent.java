package com.scholartrack.live;

import java.time.LocalDateTime;

/** Small push message. Clients react by re-fetching the affected screen over REST. */
public record LiveEvent(String type, String message, String at) {
    public static LiveEvent of(String type, String message) {
        return new LiveEvent(type, message, LocalDateTime.now().toString());
    }
}
