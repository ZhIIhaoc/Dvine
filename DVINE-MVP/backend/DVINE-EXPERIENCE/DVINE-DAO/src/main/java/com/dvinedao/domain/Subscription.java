package com.dvinedao.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Represents a user subscription entity in the system.
 * Tracks subscription status and billing through Stripe integration.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Subscription {
    private Long subscriptionId;
    private Long userId;
    private SubscriptionType subscriptionType;
    private String stripeSubscriptionId;
    private SubscriptionStatus status;
    private LocalDateTime currentPeriodEnd;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    
    // Additional fields for joined queries
    private String userEmail;
    private String userFirstName;
    private String userLastName;
    
    public static enum SubscriptionType {
        PREMIUM, PARTNER
    }
    
    public static enum SubscriptionStatus {
        ACTIVE, CANCELED, INACTIVE
    }
    
    /**
     * Check if subscription provides access to upgraded permissions
     * @return true if user should have upgraded permissions
     */
    public boolean hasAccess() {
        if (status == SubscriptionStatus.INACTIVE) {
            return false;
        }
        
        if (status == SubscriptionStatus.CANCELED) {
            // Check if current period has ended
            return currentPeriodEnd != null && LocalDateTime.now().isBefore(currentPeriodEnd);
        }
        
        return status == SubscriptionStatus.ACTIVE;
    }
    
    /**
     * Get the target permission level for this subscription type
     * @return permission level that user should have when subscription is active
     */
    public int getTargetPermission() {
        return subscriptionType == SubscriptionType.PREMIUM ? 
            PermissionLevel.PREMIUM : PermissionLevel.PARTNER;
    }
    
    /**
     * Get the fallback permission level when subscription is inactive
     * @return permission level user should revert to when subscription ends
     */
    public int getFallbackPermission() {
        return subscriptionType == SubscriptionType.PREMIUM ? 
            PermissionLevel.REGULAR : PermissionLevel.PARTNER_UNPAID;
    }
}