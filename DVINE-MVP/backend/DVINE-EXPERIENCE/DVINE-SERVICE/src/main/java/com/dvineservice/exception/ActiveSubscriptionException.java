package com.dvineservice.exception;

/**
 * Exception thrown when user tries to create a new subscription while having an active one
 */
public class ActiveSubscriptionException extends RuntimeException {
    public ActiveSubscriptionException(String message) {
        super(message);
    }
}