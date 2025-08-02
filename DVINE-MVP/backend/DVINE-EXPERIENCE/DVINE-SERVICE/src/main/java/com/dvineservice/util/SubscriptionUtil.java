package com.dvineservice.util;

import com.dvinedao.domain.Subscription;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Map;

/**
 * Utility class for subscription-related operations.
 * Handles Stripe subscription data extraction and subscription record creation.
 */
@Component
@Slf4j
public class SubscriptionUtil {
    
    /**
     * Extract current period end from Stripe subscription
     */
    public static LocalDateTime extractCurrentPeriodEnd(com.stripe.model.Subscription subscription) {
        Long timestamp = subscription.getItems().getData().get(0).getCurrentPeriodEnd();
        return LocalDateTime.ofEpochSecond(timestamp, 0, ZoneOffset.UTC);
    }
    
    /**
     * Extract userId and subscriptionType from Stripe subscription metadata
     */
    public static SubscriptionMetadata extractSubscriptionMetadata(com.stripe.model.Subscription subscription) {
        Map<String, String> metadata = subscription.getMetadata();
        
        String userIdStr = metadata.get("userId");
        String subscriptionTypeStr = metadata.get("subscriptionType");
        
        Long userId = Long.valueOf(userIdStr);
        Subscription.SubscriptionType subscriptionType = Subscription.SubscriptionType.valueOf(subscriptionTypeStr);
        
        return new SubscriptionMetadata(userId, subscriptionType);
    }
    
    /**
     * Get subscription amount based on type
     */
    public static BigDecimal getSubscriptionAmount(Subscription.SubscriptionType subscriptionType) {
        return subscriptionType == Subscription.SubscriptionType.PREMIUM ? 
            new BigDecimal("9.99") : new BigDecimal("99.99");
    }
    
    /**
     * Create a subscription record with the provided parameters
     */
    public static Subscription createSubscriptionRecord(String stripeSubscriptionId, Long userId, 
                                                       Subscription.SubscriptionType subscriptionType, 
                                                       LocalDateTime currentPeriodEnd) {
        Subscription subscription = new Subscription();
        subscription.setUserId(userId);
        subscription.setSubscriptionType(subscriptionType);
        subscription.setStripeSubscriptionId(stripeSubscriptionId);
        subscription.setStatus(Subscription.SubscriptionStatus.ACTIVE);
        subscription.setCurrentPeriodEnd(currentPeriodEnd);
        return subscription;
    }

    /**
     * Data class to hold extracted subscription metadata
     */
    @Getter
    public static class SubscriptionMetadata {
        private final Long userId;
        private final Subscription.SubscriptionType subscriptionType;

        public SubscriptionMetadata(Long userId, Subscription.SubscriptionType subscriptionType) {
            this.userId = userId;
            this.subscriptionType = subscriptionType;
        }

    }
}