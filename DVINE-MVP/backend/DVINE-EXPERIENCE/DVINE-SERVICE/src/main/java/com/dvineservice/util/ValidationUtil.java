package com.dvineservice.util;

import com.dvinedao.domain.PermissionLevel;
import com.dvinedao.domain.User;
import org.springframework.util.StringUtils;
import java.util.regex.Pattern;

public class ValidationUtil {
    
    private static final Pattern BOOKING_REFERENCE_PATTERN = Pattern.compile("^DVINE-\\d{8}-\\d{4}$");
    
    /**
     * Validates that required fields for user registration are not null or whitespace-only
     * @param user The user object to validate
     * @throws IllegalArgumentException if any required field is null, empty, or contains only whitespace
     */
    public static void validateUserRegistration(User user) {
        if (!StringUtils.hasText(user.getEmail()) || 
            !StringUtils.hasText(user.getPassword()) || 
            !StringUtils.hasText(user.getFirstName()) || 
            !StringUtils.hasText(user.getLastName())) {
            throw new IllegalArgumentException("Registration fields cannot be empty or contain only spaces");
        }
        
        // Initialize permission to REGULAR if not specified
        if (user.getPermission() == null) {
            user.setPermission(PermissionLevel.REGULAR);
        } else if (!PermissionLevel.isValidToRegister(user.getPermission())) {
            throw new IllegalArgumentException("Invalid permission level for registration. Only regular member or unpaid partner allowed");
        }
    }
    
    /**
     * Validates that a field is not null or whitespace-only
     * @param field The field value to validate
     * @param fieldName The name of the field for error messages
     * @throws IllegalArgumentException if the field is null, empty, or contains only whitespace
     */
    public static void validateRequiredField(String field, String fieldName) {
        if (!StringUtils.hasText(field)) {
            throw new IllegalArgumentException(fieldName + " cannot be empty or contain only spaces");
        }
    }
    
    /**
     * Validates that multiple fields are not null or whitespace-only
     * @param fields Array of field values to validate
     * @param fieldNames Array of field names for error messages
     * @throws IllegalArgumentException if any field is null, empty, or contains only whitespace
     */
    public static void validateRequiredFields(String[] fields, String[] fieldNames) {
        if (fields.length != fieldNames.length) {
            throw new IllegalArgumentException("Fields and field names arrays must have the same length");
        }
        
        for (int i = 0; i < fields.length; i++) {
            validateRequiredField(fields[i], fieldNames[i]);
        }
    }
    
    /**
     * Validates that a booking reference follows the correct format: DVINE-YYYYMMDD-XXXX
     * @param bookingReference The booking reference to validate
     * @throws IllegalArgumentException if the booking reference format is invalid
     */
    public static void validateBookingReferenceFormat(String bookingReference) {
        if (!StringUtils.hasText(bookingReference)) {
            throw new IllegalArgumentException("Booking reference cannot be empty");
        }
        
        if (!BOOKING_REFERENCE_PATTERN.matcher(bookingReference).matches()) {
            throw new IllegalArgumentException("Booking reference must follow format: DVINE-YYYYMMDD-XXXX");
        }
    }
}