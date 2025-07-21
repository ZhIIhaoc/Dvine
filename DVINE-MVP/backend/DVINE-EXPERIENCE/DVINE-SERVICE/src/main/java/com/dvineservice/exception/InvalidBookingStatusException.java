package com.dvineservice.exception;

/**
 * Exception thrown when an operation is attempted on a booking with invalid status.
 */
public class InvalidBookingStatusException extends RuntimeException {
    public InvalidBookingStatusException(String message) {
        super(message);
    }
}