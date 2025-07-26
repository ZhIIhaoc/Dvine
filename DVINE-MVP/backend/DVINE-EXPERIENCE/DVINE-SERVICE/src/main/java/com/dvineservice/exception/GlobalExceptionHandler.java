package com.dvineservice.exception;

import com.dvinedao.domain.ReturnResult;
import com.stripe.exception.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * This class provides centralized exception handling across all controller methods
 * in the application through the use of {@code @ExceptionHandler} methods.
 * It converts various exceptions into standardized {@link ReturnResult} responses,
 * providing consistent error handling and client-friendly error messages.
 * <p>
 * Key features:
 * <ul>
 *   <li>Generic exception handling for unexpected errors</li>
 *   <li>Specialized handling for database constraint violations (duplicate keys)</li>
 *   <li>Custom handling for validation errors (illegal arguments)</li>
 * </ul>
 * <p>
 * All exceptions are logged before being converted to appropriate response objects.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler
    public ReturnResult handleException(Exception e) {
        log.error("An error occurred:", e);
        return ReturnResult.error(e.getMessage());
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler
    public ReturnResult handleIllegalStateException(IllegalStateException e) {
        log.error("IllegalState:", e);
        return ReturnResult.error(e.getMessage());
    }

    /**
     * Handles database duplicate key exceptions.
     * <p>
     * Extracts the field name from the error message and returns a user-friendly
     * error response (e.g., "The email already exists").
     *
     * @param e The database constraint violation exception
     * @return A standardized error response
     */
    @ResponseStatus(HttpStatus.CONFLICT)
    @ExceptionHandler
    public ReturnResult handleDuplicateKeyException(DuplicateKeyException e) {
        // full JDBC message
        log.error("Duplicate key error:", e);
        String msg = e.getMessage();   // "... for key 'users.email'..."

        // --- Step 1: get whatever is between the quotes after "for key "
        Pattern p = Pattern.compile("for key '([^']+)'");
        Matcher m = p.matcher(msg);
        String keyToken = m.find() ? m.group(1) : "duplicate_key";   // users.email

        // --- Step 2: keep only the part after the last dot
        String key = keyToken.substring(keyToken.lastIndexOf('.') + 1);   // email

        return ReturnResult.error("The " + key + " already exists");
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ExceptionHandler
    public ReturnResult handleDataIntegrityViolationException(DataIntegrityViolationException e) {
        log.error("Data integrity violation:", e);

        String msg = e.getMessage();

        // Check if it's a foreign key constraint violation
        if (msg != null && msg.contains("foreign key constraint fails")) {
            // Extract the referenced table and field
            Pattern p = Pattern.compile("FOREIGN KEY \\(`([^`]+)`\\) REFERENCES `([^`]+)`");
            Matcher m = p.matcher(msg);

            if (m.find()) {
                String referencedTable = m.group(2); // e.g., "tours"

                // Convert table name to entity name (tours -> Tour)
                String entityName = referencedTable.substring(0, 1).toUpperCase() +
                                   referencedTable.substring(1, referencedTable.length() - 1);

                return ReturnResult.error(entityName + " not found");
            }
        }

        // Fallback for other data integrity violations (use 400 for these)
        return ReturnResult.error("Data integrity constraint violation");
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler
    public ReturnResult handleIllegalArgumentException(IllegalArgumentException e) {
        log.error("An error occurred:", e);
        return ReturnResult.error(e.getMessage());
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler
    public ReturnResult handleMethodArgumentTypeMismatchException(MethodArgumentTypeMismatchException e) {
        log.error("Method argument type mismatch:", e);
        
        String paramName = e.getName();
        Object value = e.getValue();
        Class<?> requiredType = e.getRequiredType();
        
        // Handle Payment.PaymentStatus enum specifically
        if (requiredType != null && requiredType.getSimpleName().equals("PaymentStatus")) {
            return ReturnResult.error("Invalid payment status");
        }
        
        // Handle other enum conversion errors
        if (requiredType != null && requiredType.isEnum()) {
            return ReturnResult.error("Invalid " + paramName + " value: '" + value + "'. Valid values are: " + 
                                    String.join(", ", getEnumValues(requiredType)));
        }
        
        return ReturnResult.error("Invalid " + paramName + " format: '" + value + "'");
    }
    
    private String[] getEnumValues(Class<?> enumClass) {
        return java.util.Arrays.stream(enumClass.getEnumConstants())
                .map(Object::toString)
                .toArray(String[]::new);
    }

    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    @ExceptionHandler
    public ReturnResult handleMissingTokenException(MissingTokenException e) {
        log.error("Missing Token:", e);
        return ReturnResult.error(e.getMessage());
    }

    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    @ExceptionHandler
    public ReturnResult handleTokenIsInvalid(InvalidTokenException e) {
        log.error("Invalid Token:", e);
        return ReturnResult.error(e.getMessage());
    }

    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    @ExceptionHandler
    public ReturnResult handleWrongCredentialsException(LoginCredentialIncorrectException e) {
        log.error("Wrong credentials error:", e);
        return ReturnResult.error(e.getMessage());
    }

    @ResponseStatus(HttpStatus.FORBIDDEN)
    @ExceptionHandler
    public ReturnResult handlePermissionDeniedException(PermissionDeniedException e) {
        log.error("Permission denied error:", e);
        return ReturnResult.error(e.getMessage());
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ExceptionHandler
    public ReturnResult handleNotFoundException(NotFoundException e) {
        log.error("Resource not found error:", e);
        return ReturnResult.error(e.getMessage());
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler
    public ReturnResult handleInvalidBookingStatusException(InvalidBookingStatusException e) {
        log.error("Invalid booking status error:", e);
        return ReturnResult.error(e.getMessage());
    }

    @ResponseStatus(HttpStatus.ACCEPTED)
    @ExceptionHandler
    public ReturnResult handleTourSubmittedException(TourSubmittedException e) {
        log.info("Tour submitted for approval:", e);
        return ReturnResult.success();
    }

    // Payment-specific exception handlers

    /**
     * Handles Stripe API errors - general Stripe API issues
     */
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler
    public ReturnResult handleStripeException(StripeException e) {
        log.error("Stripe API error:", e);
        return ReturnResult.error("Payment processing error: " + e.getUserMessage());
    }

    /**
     * Handles Stripe card errors - declined cards, insufficient funds, etc.
     */
    @ResponseStatus(HttpStatus.PAYMENT_REQUIRED)
    @ExceptionHandler
    public ReturnResult handleCardException(CardException e) {
        log.error("Stripe card error:", e);
        return ReturnResult.error("Payment failed: " + e.getUserMessage());
    }

    /**
     * Handles invalid Stripe request parameters
     */
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler
    public ReturnResult handleInvalidRequestException(InvalidRequestException e) {
        log.error("Invalid Stripe request:", e);
        return ReturnResult.error("Invalid payment request: " + e.getUserMessage());
    }

    /**
     * Handles Stripe authentication errors - invalid API keys
     */
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    @ExceptionHandler
    public ReturnResult handleAuthenticationException(AuthenticationException e) {
        log.error("Stripe authentication error:", e);
        return ReturnResult.error("Payment service authentication failed");
    }

    /**
     * Handles Stripe API connection errors
     */
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    @ExceptionHandler
    public ReturnResult handleApiConnectionException(ApiConnectionException e) {
        log.error("Stripe API connection error:", e);
        return ReturnResult.error("Payment service unavailable. Please try again later.");
    }

    /**
     * Handles Stripe rate limiting
     */
    @ResponseStatus(HttpStatus.TOO_MANY_REQUESTS)
    @ExceptionHandler
    public ReturnResult handleRateLimitException(RateLimitException e) {
        log.error("Stripe rate limit exceeded:", e);
        return ReturnResult.error("Too many payment requests. Please try again later.");
    }

    /**
     * Handles Stripe webhook signature verification failures
     */
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler
    public ReturnResult handleSignatureVerificationException(SignatureVerificationException e) {
        log.error("Stripe webhook signature verification failed:", e);
        return ReturnResult.error("Invalid webhook signature");
    }

    /**
     * Handles payment status errors - operations attempted on payments with invalid status
     */
    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    @ExceptionHandler
    public ReturnResult handlePaymentStatusException(PaymentStatusException e) {
        log.error("Payment status error:", e);
        return ReturnResult.error(e.getMessage());
    }
}
