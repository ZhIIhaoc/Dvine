package com.dvinedao.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for subscription status queries
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubscriptionStatusResponse {
    private boolean hasActiveSubscription;
    private Subscription.SubscriptionType subscriptionType;
    private Subscription.SubscriptionStatus status;
    private LocalDateTime currentPeriodEnd;
    private boolean hasAccess;
    private int currentPermission;
    
    public static SubscriptionStatusResponse noSubscription(int currentPermission) {
        SubscriptionStatusResponse response = new SubscriptionStatusResponse();
        response.setHasActiveSubscription(false);
        response.setHasAccess(false);
        response.setCurrentPermission(currentPermission);
        return response;
    }
    
    public static SubscriptionStatusResponse fromSubscription(Subscription subscription, int currentPermission) {
        SubscriptionStatusResponse response = new SubscriptionStatusResponse();
        if (subscription.getStatus().equals(Subscription.SubscriptionStatus.ACTIVE)) {
            response.setHasActiveSubscription(true);
        } else if (subscription.getStatus().equals(Subscription.SubscriptionStatus.CANCELED)) {
            response.setHasActiveSubscription(false);
        }
        response.setSubscriptionType(subscription.getSubscriptionType());
        response.setStatus(subscription.getStatus());
        response.setCurrentPeriodEnd(subscription.getCurrentPeriodEnd());
        response.setHasAccess(subscription.hasAccess());
        response.setCurrentPermission(currentPermission);
        return response;
    }
}