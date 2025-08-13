package com.dvineservice.exception;

/**
 * Exception thrown when a booking cannot be found.
 */
public class BookingNotFoundException extends NotFoundException {
    public BookingNotFoundException(String message) {
        super(message);
    }
}