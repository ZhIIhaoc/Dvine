package com.dvineservice.exception;

import com.dvinedao.domain.ReturnResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

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

    @ExceptionHandler
    public ReturnResult handleException(Exception e) {
        log.error("An error occurred:", e);
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

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler
    public ReturnResult handleIllegalArgumentException(IllegalArgumentException e) {
        log.error("An error occurred:", e);
        return ReturnResult.error(e.getMessage());
    }

    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    @ExceptionHandler
    public ReturnResult handleTokenIsInvalid(InvalidTokenException e) {
        log.error("Invalid Token:", e);
        return ReturnResult.error(e.getMessage());
    }

    @ExceptionHandler
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ReturnResult handleWrongCredentialsException(LoginCredentialIncorrectException e) {
        log.error("Wrong credentials error:", e);
        return ReturnResult.error(e.getMessage());
    }
}
