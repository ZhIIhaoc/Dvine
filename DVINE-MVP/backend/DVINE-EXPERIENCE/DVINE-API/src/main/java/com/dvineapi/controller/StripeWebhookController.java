package com.dvineapi.controller;

import com.dvinedao.domain.ReturnResult;
import com.dvineservice.service.StripeWebhookService;
import com.stripe.exception.SignatureVerificationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for Stripe webhook processing.
 * Handles incoming Stripe webhook events for payment processing.
 */
@RestController
@RequestMapping("/webhooks")
@Slf4j
public class StripeWebhookController {
    
    @Autowired
    private StripeWebhookService stripeWebhookService;
    
    /**
     * Process Stripe webhook events
     * This endpoint receives webhook events from Stripe when payment events occur
     */
    @PostMapping("/stripe")
    @ResponseStatus(HttpStatus.OK)
    public ReturnResult handleStripeWebhook(@RequestBody String payload,
                                           @RequestHeader("Stripe-Signature") String signature) 
                                           throws SignatureVerificationException {
        log.info("Received Stripe webhook");
        
        stripeWebhookService.processWebhook(payload, signature);
        return ReturnResult.success();
    }
}