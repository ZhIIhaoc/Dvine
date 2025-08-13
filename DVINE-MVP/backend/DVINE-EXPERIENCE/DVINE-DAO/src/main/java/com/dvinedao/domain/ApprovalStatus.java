package com.dvinedao.domain;

/**
 * Constants for approval status values
 * Used across all layers (database, backend, frontend) for consistency
 */
public final class ApprovalStatus {
    
    // Status constants - aligned with frontend expectations
    public static final int PENDING = 0;
    public static final int APPROVED = 1;
    public static final int REJECTED = 2;
    
    // Prevent instantiation
    private ApprovalStatus() {
        throw new AssertionError("Utility class should not be instantiated");
    }
    
    /**
     * Validates if the given status code is valid
     * @param status the status code to validate
     * @return true if valid, false otherwise
     */
    public static boolean isValid(Integer status) {
        return status != null && (status == PENDING || status == APPROVED || status == REJECTED);
    }
    
    /**
     * Converts status code to display string
     * @param status the status code
     * @return display string for the status
     */
    public static String getDisplayName(Integer status) {
        if (status == null) return "Unknown";
        switch (status) {
            case PENDING: return "Pending";
            case APPROVED: return "Approved";
            case REJECTED: return "Rejected";
            default: return "Unknown";
        }
    }
    
    /**
     * Checks if status is pending
     * @param status the status to check
     * @return true if pending
     */
    public static boolean isPending(Integer status) {
        return status != null && status == PENDING;
    }
    
    /**
     * Checks if status is approved
     * @param status the status to check
     * @return true if approved
     */
    public static boolean isApproved(Integer status) {
        return status != null && status == APPROVED;
    }
    
    /**
     * Checks if status is rejected
     * @param status the status to check
     * @return true if rejected
     */
    public static boolean isRejected(Integer status) {
        return status != null && status == REJECTED;
    }
}