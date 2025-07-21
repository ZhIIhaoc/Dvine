package com.dvineservice.exception;

/**
 * Exception thrown when Stripe webhook processing fails.
 */
public class StripeWebhookException extends RuntimeException {
    public StripeWebhookException(String message) {
        super(message);
    }
    
    public StripeWebhookException(String message, Throwable cause) {
        super(message, cause);
    }
}