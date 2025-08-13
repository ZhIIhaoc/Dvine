package com.dvineservice.service;

import com.dvinedao.domain.Subscription;
import com.dvinedao.domain.SubscriptionCheckoutResponse;
import com.dvinedao.domain.SubscriptionStatusResponse;
import com.stripe.exception.StripeException;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Service interface for managing user subscriptions
 */
public interface SubscriptionService {
    
    /**
     * Create a subscription checkout session
     *
     * @param subscriptionType PREMIUM or PARTNER
     * @return Checkout session details
     */
    SubscriptionCheckoutResponse createCheckoutSession(Subscription.SubscriptionType subscriptionType) throws StripeException;
    
    /**
     * Get user's current subscription status
     * @param userId User ID
     * @return Subscription status details
     */
    SubscriptionStatusResponse getSubscriptionStatus(Long userId);
    
    /**
     * Unsubscribe user's subscription (will remain active until period end)
     *
     * @param userId User ID
     */
    void unsubscribeUser(Long userId) throws StripeException;
    
    /**
     * Process subscription creation from webhook
     * @param stripeSubscriptionId Stripe subscription ID
     * @param userId User ID
     * @param subscriptionType Subscription type
     * @param currentPeriodEnd Period end timestamp
     */
    void processSubscriptionCreated(String stripeSubscriptionId, Long userId, 
                                  Subscription.SubscriptionType subscriptionType,
                                  LocalDateTime currentPeriodEnd);
    
    /**
     * Process subscription update from webhook
     * @param stripeSubscriptionId Stripe subscription ID
     * @param status New subscription status
     * @param currentPeriodEnd Updated period end timestamp
     */
    void processSubscriptionUpdated(String stripeSubscriptionId, 
                                  Subscription.SubscriptionStatus status,
                                  LocalDateTime currentPeriodEnd);
    
    /**
     * Process subscription deletion from webhook
     * @param stripeSubscriptionId Stripe subscription ID
     */
    void processSubscriptionDeleted(String stripeSubscriptionId);
    
    /**
     * Process successful subscription payment from webhook
     * @param stripeSubscriptionId Stripe subscription ID
     * @param amount Payment amount
     * @param paymentIntentId Stripe payment intent ID
     */
    void processSubscriptionPaymentSuccess(String stripeSubscriptionId, 
                                         BigDecimal amount,
                                         String paymentIntentId);
    
    /**
     * Process failed subscription payment from webhook
     * @param stripeSubscriptionId Stripe subscription ID
     * @param failureReason Reason for payment failure
     */
    void processSubscriptionPaymentFailed(String stripeSubscriptionId, String failureReason);
    
    /**
     * Update user permissions based on subscription status
     * Called after subscription status changes
     * @param userId User ID
     */
    void updateUserPermissions(Long userId);
    
    /**
     * Update user permissions based on subscription status
     * Called after subscription status changes
     * @param userId User ID
     * @param subscription Subscription object to use (avoids database re-query)
     */
    void updateUserPermissions(Long userId, Subscription subscription);
}