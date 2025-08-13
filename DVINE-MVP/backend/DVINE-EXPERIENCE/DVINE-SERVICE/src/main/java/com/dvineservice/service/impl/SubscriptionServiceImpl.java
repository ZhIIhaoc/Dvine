package com.dvineservice.service.impl;

import com.dvinedao.domain.*;
import com.dvinedao.mapper.PaymentMapper;
import com.dvinedao.mapper.SubscriptionMapper;
import com.dvinedao.mapper.UserMapper;
import com.dvineservice.exception.ActiveSubscriptionException;
import com.dvineservice.exception.NotFoundException;
import com.dvineservice.service.SubscriptionService;
import com.dvineservice.util.StripeUtil;
import com.dvineservice.util.SubscriptionUtil;
import com.dvineservice.util.UserUtil;
import com.dvineservice.util.ValidationUtil;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Implementation of SubscriptionService for managing user subscriptions
 */
@Service
@Slf4j
public class SubscriptionServiceImpl implements SubscriptionService {
    
    @Autowired
    private SubscriptionMapper subscriptionMapper;
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private PaymentMapper paymentMapper;
    
    @Autowired
    private StripeUtil stripeUtil;


    //--------------------------For REST API--------------------------
    
    @Override
    @Transactional
    public SubscriptionCheckoutResponse createCheckoutSession(Subscription.SubscriptionType subscriptionType) throws StripeException {
        Long userId = UserUtil.getCurrentUserId();
        log.info("Creating subscription checkout session for user {} type {}", userId, subscriptionType);

        // Validate user exists
        User user = userMapper.findUserById(userId).toUser();
        if (user == null) {
            throw new NotFoundException("User not found");
        }
        
        // Validate user permission level for subscription type
        ValidationUtil.validateUserCanSubscribe(user, subscriptionType);
        
        // Check if user already has an active subscription
        Subscription existingSubscription = subscriptionMapper.selectActiveSubscriptionByUserId(userId);
        if (existingSubscription != null && existingSubscription.hasAccess()) {
            throw new ActiveSubscriptionException("User already has an active subscription");
        }
        
        // Create Stripe checkout session
        Session session = stripeUtil.createSubscriptionCheckoutSession(userId, subscriptionType.name()
        );
        
        log.info("Created subscription checkout session {} for user {} type {}", 
                 session.getId(), userId, subscriptionType);
        
        return new SubscriptionCheckoutResponse(session.getUrl(), session.getId());
    }
    
    @Override
    public SubscriptionStatusResponse getSubscriptionStatus(Long userId) {
        User user = userMapper.findUserById(userId).toUser();
        if (user == null) {
            throw new NotFoundException("User not found");
        }
        
        Subscription subscription = subscriptionMapper.selectActiveSubscriptionByUserId(userId);
        if (subscription == null) {
            return SubscriptionStatusResponse.noSubscription(user.getPermission());
        }
        
        return SubscriptionStatusResponse.fromSubscription(subscription, user.getPermission());
    }
    
    @Override
    @Transactional
    public void unsubscribeUser(Long userId) throws StripeException {
        Subscription subscription = subscriptionMapper.selectActiveSubscriptionByUserId(userId);
        if (subscription == null || !subscription.hasAccess()) {
            throw new IllegalArgumentException("No active subscription found for user");
        }
        
        // Cancel subscription in Stripe with cancel_at_period_end = true
        com.stripe.model.Subscription stripeSubscription = 
            com.stripe.model.Subscription.retrieve(subscription.getStripeSubscriptionId());
        
        com.stripe.param.SubscriptionUpdateParams params = 
            com.stripe.param.SubscriptionUpdateParams.builder()
                .setCancelAtPeriodEnd(true)
                .build();
        stripeSubscription.update(params);
        
        log.info("Unsubscribed user {} - subscription {} will cancel at period end", userId, subscription.getStripeSubscriptionId());
    }

    //--------------------------For Webhooks--------------------------
    
    @Override
    @Transactional
    public void processSubscriptionCreated(String stripeSubscriptionId, Long userId, 
                                         Subscription.SubscriptionType subscriptionType,
                                         LocalDateTime currentPeriodEnd) {
        // Create subscription record
        Subscription subscription = SubscriptionUtil.createSubscriptionRecord(stripeSubscriptionId, userId, subscriptionType, currentPeriodEnd);
        
        subscriptionMapper.insertSubscription(subscription);

        // Update user permissions
        updateUserPermissions(userId);
        
        log.info("Created subscription record {} for user {} type {}", 
                 stripeSubscriptionId, userId, subscriptionType);
    }
    
    @Override
    @Transactional
    public void processSubscriptionUpdated(String stripeSubscriptionId, 
                                         Subscription.SubscriptionStatus status,
                                         LocalDateTime currentPeriodEnd) {
        subscriptionMapper.updateSubscriptionByStripeId(stripeSubscriptionId, status, currentPeriodEnd);
        
        // Update user permissions if subscription status changed
        Subscription subscription = subscriptionMapper.selectSubscriptionByStripeId(stripeSubscriptionId);
        if (subscription != null) {
            updateUserPermissions(subscription.getUserId(), subscription);
        }
        
        log.info("Updated subscription {} status to {}", stripeSubscriptionId, status);
    }
    
    @Override
    @Transactional
    public void processSubscriptionDeleted(String stripeSubscriptionId) {
        // Set subscription to INACTIVE
        subscriptionMapper.updateSubscriptionByStripeId(
                stripeSubscriptionId,
                Subscription.SubscriptionStatus.INACTIVE,
                LocalDateTime.now()
        );

        // Get subscription before marking as INACTIVE
        Subscription subscription = subscriptionMapper.selectSubscriptionByStripeId(stripeSubscriptionId);
        if (subscription == null) {
            log.warn("Subscription not found for deletion: {}", stripeSubscriptionId);
            return;
        }

        // Update user permissions using the subscription object
        updateUserPermissions(subscription.getUserId(), subscription);
        
        log.info("Deleted subscription {}", stripeSubscriptionId);
    }
    
    @Override
    @Transactional
    public void processSubscriptionPaymentSuccess(String stripeSubscriptionId, 
                                                BigDecimal amount, String paymentIntentId) {
        Subscription subscription = subscriptionMapper.selectSubscriptionByStripeId(stripeSubscriptionId);
        if (subscription == null) {
            log.warn("Subscription not found for payment success: {}", stripeSubscriptionId);
            return;
        }
        
        // Ensure subscription is ACTIVE
        if (subscription.getStatus() != Subscription.SubscriptionStatus.ACTIVE) {
            subscriptionMapper.updateSubscriptionByStripeId(
                stripeSubscriptionId,
                Subscription.SubscriptionStatus.ACTIVE,
                subscription.getCurrentPeriodEnd()
            );
            updateUserPermissions(subscription.getUserId(), subscription);
        }
        
        // Create payment record
        Payment payment = new Payment();
        payment.setUserId(subscription.getUserId());
        payment.setSubscriptionId(subscription.getSubscriptionId());
        payment.setPaymentType(Payment.PaymentType.SUBSCRIPTION);
        payment.setStripePaymentIntentId(paymentIntentId);
        payment.setAmount(amount);
        payment.setCurrency("AUD");
        payment.setStatus(Payment.PaymentStatus.SUCCEEDED);
        payment.setPaidAt(LocalDateTime.now());
        
        paymentMapper.createPayment(payment);
        
        log.info("Processed subscription payment success for {} amount {}", stripeSubscriptionId, amount);
    }
    
    @Override
    @Transactional
    public void processSubscriptionPaymentFailed(String stripeSubscriptionId, String failureReason) {
        // Set subscription to INACTIVE
        subscriptionMapper.updateSubscriptionByStripeId(
            stripeSubscriptionId,
            Subscription.SubscriptionStatus.INACTIVE,
            LocalDateTime.now()
        );
        
        // Update user permissions (downgrade)
        Subscription subscription = subscriptionMapper.selectSubscriptionByStripeId(stripeSubscriptionId);
        if (subscription != null) {
            updateUserPermissions(subscription.getUserId(), subscription);
            
            // Create failed payment record
            Payment payment = new Payment();
            payment.setUserId(subscription.getUserId());
            payment.setSubscriptionId(subscription.getSubscriptionId());
            payment.setPaymentType(Payment.PaymentType.SUBSCRIPTION);
            payment.setAmount(getSubscriptionAmount(subscription.getSubscriptionType()));
            payment.setCurrency("AUD");
            payment.setStatus(Payment.PaymentStatus.FAILED);
            payment.setFailureReason(failureReason);
            
            paymentMapper.createPayment(payment);
        }
        
        log.warn("Processed subscription payment failure for {}: {}", stripeSubscriptionId, failureReason);
    }

    //--------------------------User Permissions--------------------------
    @Override
    @Transactional
    public void updateUserPermissions(Long userId) {
        updateUserPermissions(userId, null);
    }
    
    @Override
    @Transactional
    public void updateUserPermissions(Long userId, Subscription subscription) {
        User user = userMapper.findUserById(userId).toUser();
        if (user == null) {
            log.warn("User not found");
            throw new NotFoundException("User not found");
        }
        
        // Use provided subscription or query for active subscription
        if (subscription == null) {
            subscription = subscriptionMapper.selectActiveSubscriptionByUserId(userId);
        }
        
        int newPermission;
        if (subscription != null && subscription.hasAccess()) {
            // User has active subscription - upgrade permission
            newPermission = subscription.getTargetPermission();
        } else {
            // No active subscription - use fallback permission based on last subscription type
            if (subscription != null) {
                newPermission = subscription.getFallbackPermission();
            } else {
                // No subscription at all - keep current permission or default to REGULAR
                newPermission = user.getPermission() != null ? user.getPermission() : 0;
            }
        }

        if (user.getPermission() != newPermission) {
            int oldPermission = user.getPermission();
            userMapper.updateUserPermission(userId, newPermission);
            log.info("Updated user {} permission from {} to {}", userId, oldPermission, newPermission);
        }
    }

    /**
     * Get subscription amount based on type
     */
    private BigDecimal getSubscriptionAmount(Subscription.SubscriptionType subscriptionType) {
        return subscriptionType == Subscription.SubscriptionType.PREMIUM ?
            new BigDecimal("9.99") : new BigDecimal("99.99");
    }
}