package com.dvineservice.service;

import com.stripe.exception.SignatureVerificationException;

/**
 * Service interface for processing Stripe webhook events.
 * Handles all Stripe webhook event types related to payments.
 */
public interface StripeWebhookService {
    
    /**
     * Process incoming Stripe webhook payload
     * 
     * @param payload The raw webhook payload from Stripe
     * @param signature The Stripe signature header for verification
     */
    void processWebhook(String payload, String signature) throws SignatureVerificationException;
}