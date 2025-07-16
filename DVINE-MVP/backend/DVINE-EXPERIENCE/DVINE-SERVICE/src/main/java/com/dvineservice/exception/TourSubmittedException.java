package com.dvineservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.ACCEPTED)
public class TourSubmittedException extends RuntimeException {
    public TourSubmittedException() {
        super("Tour submitted for approval");
    }
}