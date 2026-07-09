package com.devconnect.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateRepostException extends RuntimeException {
    public DuplicateRepostException(String message) {
        super(message);
    }
}
