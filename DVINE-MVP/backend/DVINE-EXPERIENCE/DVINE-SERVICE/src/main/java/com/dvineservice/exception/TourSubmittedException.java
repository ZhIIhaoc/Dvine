package com.dvineservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.ACCEPTED)
public class TourSubmittedException extends RuntimeException {
    private final Long pendingTourId;
    
    public TourSubmittedException() {
        super("Tour submitted for approval");
        this.pendingTourId = null;
    }
    
    public TourSubmittedException(Long pendingTourId) {
        super("Tour submitted for approval");
        this.pendingTourId = pendingTourId;
    }
    
    public Long getPendingTourId() {
        return pendingTourId;
    }
}