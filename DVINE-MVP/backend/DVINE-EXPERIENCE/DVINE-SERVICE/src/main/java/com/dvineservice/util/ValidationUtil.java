package com.dvineservice.util;

import com.dvinedao.domain.User;
import org.springframework.util.StringUtils;

public class ValidationUtil {
    
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
}