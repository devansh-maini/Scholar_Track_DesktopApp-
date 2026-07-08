package com.scholartrack.report;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class ReportException extends RuntimeException {
    private final HttpStatus status;

    public ReportException(String message) {
        super(message);
        this.status = HttpStatus.BAD_REQUEST;
    }

    public ReportException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
