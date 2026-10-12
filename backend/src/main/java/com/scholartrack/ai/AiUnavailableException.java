package com.scholartrack.ai;

/** Thrown when the AI provider cannot be used. The rest of ScholarTrack keeps working; the API answers 503. */
public class AiUnavailableException extends RuntimeException {
    public AiUnavailableException(String message) { super(message); }
}
