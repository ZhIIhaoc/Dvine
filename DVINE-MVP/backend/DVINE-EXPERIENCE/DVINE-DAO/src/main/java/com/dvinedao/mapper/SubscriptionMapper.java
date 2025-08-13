package com.dvinedao.mapper;

import com.dvinedao.domain.Subscription;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface SubscriptionMapper {
    
    /**
     * Insert a new subscription
     */
    void insertSubscription(Subscription subscription);
    
    /**
     * Select subscription by ID
     */
    Subscription selectSubscriptionById(@Param("subscriptionId") Long subscriptionId);
    
    /**
     * Select subscription by user ID and status
     */
    Subscription selectActiveSubscriptionByUserId(@Param("userId") Long userId);
    
    /**
     * Select subscription by Stripe subscription ID
     */
    Subscription selectSubscriptionByStripeId(@Param("stripeSubscriptionId") String stripeSubscriptionId);
    
    /**
     * Update subscription status and period end
     */
    void updateSubscriptionStatus(@Param("subscriptionId") Long subscriptionId, 
                                 @Param("status") Subscription.SubscriptionStatus status,
                                 @Param("currentPeriodEnd") java.time.LocalDateTime currentPeriodEnd);
    
    /**
     * Update subscription by Stripe subscription ID
     */
    void updateSubscriptionByStripeId(@Param("stripeSubscriptionId") String stripeSubscriptionId,
                                     @Param("status") Subscription.SubscriptionStatus status,
                                     @Param("currentPeriodEnd") java.time.LocalDateTime currentPeriodEnd);
    
    /**
     * Select all subscriptions for a user (for history/admin purposes)
     */
    List<Subscription> selectSubscriptionsByUserId(@Param("userId") Long userId);
    
    /**
     * Select subscriptions that need to be transitioned from CANCELED to INACTIVE
     * (where currentPeriodEnd has passed)
     */
    List<Subscription> selectExpiredCanceledSubscriptions();
    
    /**
     * Delete subscription (for testing/admin purposes)
     */
    void deleteSubscription(@Param("subscriptionId") Long subscriptionId);
}