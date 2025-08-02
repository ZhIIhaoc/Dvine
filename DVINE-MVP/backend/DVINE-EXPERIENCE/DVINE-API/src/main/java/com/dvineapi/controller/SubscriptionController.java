package com.dvineapi.controller;

import com.dvinedao.domain.ReturnResult;
import com.dvinedao.domain.Subscription;
import com.dvinedao.domain.SubscriptionCheckoutResponse;
import com.dvinedao.domain.SubscriptionStatusResponse;
import com.dvineservice.service.SubscriptionService;
import com.dvineservice.util.UserUtil;
import com.stripe.exception.StripeException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for subscription management operations
 */
@RestController
@RequestMapping("/subscription")
public class SubscriptionController {
    private static final Logger log = LoggerFactory.getLogger(SubscriptionController.class);
    
    @Autowired
    private SubscriptionService subscriptionService;
    
    /**
     * Create subscription checkout session
     * POST /subscription/checkout/{type}
     */
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/checkout/{type}")
    public ReturnResult createCheckoutSession(@PathVariable Subscription.SubscriptionType type) throws StripeException {
        // Generate URLs in backend (no request body needed)
        SubscriptionCheckoutResponse response = subscriptionService.createCheckoutSession(type);
        return ReturnResult.success(response);
    }
    
    /**
     * Get current user's subscription status
     * GET /subscription/status
     */
    @ResponseStatus(HttpStatus.OK)
    @GetMapping("/status")
    public ReturnResult getSubscriptionStatus() {
        Long userId = UserUtil.getCurrentUserId();
        log.info("Getting subscription status for user {}", userId);
        
        SubscriptionStatusResponse response = subscriptionService.getSubscriptionStatus(userId);
        return ReturnResult.success(response);
    }
    
    /**
     * Unsubscribe current user's subscription
     * POST /subscription/unsubscribe
     */
    @ResponseStatus(HttpStatus.OK)
    @PostMapping("/unsubscribe")
    public ReturnResult unsubscribeUser() throws StripeException {
        Long userId = UserUtil.getCurrentUserId();
        log.info("Unsubscribing user {}", userId);
        
        subscriptionService.unsubscribeUser(userId);

        return ReturnResult.success();

    }
    
}