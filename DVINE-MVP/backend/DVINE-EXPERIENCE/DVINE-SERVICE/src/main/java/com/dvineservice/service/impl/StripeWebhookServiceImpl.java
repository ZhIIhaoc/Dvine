package com.dvineservice.service.impl;

import com.dvinedao.domain.Booking;
import com.dvinedao.domain.Subscription;
import com.dvineservice.exception.StripeWebhookException;
import com.dvineservice.service.BookingService;
import com.dvineservice.service.PaymentService;
import com.dvineservice.service.StripeWebhookService;
import com.dvineservice.service.SubscriptionService;
import com.dvineservice.util.StripeUtil;
import com.dvineservice.util.SubscriptionUtil;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Charge;
import com.stripe.model.Event;
import com.stripe.model.Invoice;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.model.checkout.Session;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

/**
 * Implementation of StripeWebhookService for processing Stripe webhook events.
 */
@Service
@Slf4j
public class StripeWebhookServiceImpl implements StripeWebhookService {
    
    @Autowired
    private StripeUtil stripeUtil;
    
    @Autowired
    private BookingService bookingService;
    
    @Autowired
    private PaymentService paymentService;
    
    @Autowired
    private SubscriptionService subscriptionService;

    @Transactional
    @Override
    public void processWebhook(String payload, String signature) throws SignatureVerificationException {
        // Verify webhook signature
        Event event = stripeUtil.constructWebhookEvent(payload, signature);
        log.info("Processing Stripe webhook:{}", event.getType());
        
        // Process different event types
        switch (event.getType()) {
            case "checkout.session.completed":
                handleCheckoutSessionCompleted(event);
                break;
                
            case "checkout.session.expired":
                handleCheckoutSessionExpired(event);
                break;
                
            case "payment_intent.succeeded":
                handlePaymentIntentSucceeded(event);
                break;
                
            case "payment_intent.payment_failed":
                handlePaymentIntentFailed(event);
                break;
                
            case "payment_intent.canceled":
                handlePaymentIntentCanceled(event);
                break;
                
            case "charge.refunded":
                handleChargeRefunded(event);
                break;
                
            // Subscription webhook events
            case "customer.subscription.created":
                handleSubscriptionCreated(event);
                break;
                
            case "customer.subscription.updated":
                handleSubscriptionUpdated(event);
                break;
                
            case "customer.subscription.deleted":
                handleSubscriptionDeleted(event);
                break;
                
            case "invoice.payment_succeeded":
                handleInvoicePaymentSucceeded(event);
                break;
                
            case "invoice.payment_failed":
                handleInvoicePaymentFailed(event);
                break;
                
            default:
                log.info("Unhandled Stripe event type: {}", event.getType());
                break;
        }
        
        log.info("Successfully processed Stripe webhook event: {}", event.getType());
    }
    
    /**
     * Handle checkout session completed event
     * This occurs when user completes the Stripe checkout form
     * Distinguishes between booking and subscription checkout sessions
     */
    @Transactional
    protected void handleCheckoutSessionCompleted(Event event) {
        Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
        if (session == null) {
            throw new StripeWebhookException("Session object not found in checkout.session.completed event");
        }
        
        // Check session metadata to determine session type
        if (session.getMetadata() == null) {
            throw new StripeWebhookException("No metadata found in checkout session");
        }
        
        // Distinguish between booking and subscription sessions
        if (session.getMetadata().containsKey("bookingId")) {
            handleBookingCheckoutCompleted(session);
        } else if (session.getMetadata().containsKey("subscriptionType")) {
            handleSubscriptionCheckoutCompleted(session);
        } else {
            throw new StripeWebhookException("Unable to determine checkout session type - missing bookingId or subscriptionType in metadata");
        }
    }
    
    /**
     * Handle booking checkout session completed
     */
    private void handleBookingCheckoutCompleted(Session session) {
        Long bookingId = stripeUtil.extractBookingId(session);
        log.info("Booking checkout session completed for booking {}: {}", bookingId, session.getId());
        
        // Update payment status to succeeded
        paymentService.markPaymentSucceeded(
            session.getId(),
            session.getPaymentIntent(),
            session.getPaymentMethodTypes().get(0) // Get first payment method
        );
        
        // Confirm the booking
        bookingService.confirmBooking(bookingId, session);
    }
    
    /**
     * Handle subscription checkout session completed
     */
    private void handleSubscriptionCheckoutCompleted(Session session) {
        Long userId = stripeUtil.extractUserId(session);
        String subscriptionType = stripeUtil.extractSubscriptionType(session);
        
        log.info("Subscription checkout session completed for user {} type {}: {}", 
                 userId, subscriptionType, session.getId());
        
        // For subscription sessions, the actual subscription creation is handled by
        // the "customer.subscription.created" webhook event
        // Here we just log and potentially update any session-related tracking
        
        // Note: Subscription payment processing is handled by subscription webhook events
        // (customer.subscription.created, invoice.payment_succeeded, etc.)
    }
    
    /**
     * Handle checkout session expired event
     * This occurs when user doesn't complete payment within the time limit
     * Distinguishes between booking and subscription checkout sessions
     */
    @Transactional
    protected void handleCheckoutSessionExpired(Event event) {
        Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
        if (session == null) {
            throw new StripeWebhookException("Session object not found in checkout.session.expired event");
        }

        // Check session metadata to determine session type
        if (session.getMetadata() == null) {
            throw new StripeWebhookException("No metadata found in expired checkout session");
        }

        // Distinguish between booking and subscription sessions
        if (session.getMetadata().containsKey("bookingId")) {
            handleBookingCheckoutExpired(session);
        } else if (session.getMetadata().containsKey("subscriptionType")) {
            handleSubscriptionCheckoutExpired(session);
        } else {
            throw new StripeWebhookException("Unable to determine expired checkout session type - missing bookingId or subscriptionType in metadata");
        }
    }

    /**
     * Handle booking checkout session expired
     */
    private void handleBookingCheckoutExpired(Session session) {
        Long bookingId = stripeUtil.extractBookingId(session);
        log.info("Booking checkout session expired for booking {}: {}", bookingId, session.getId());

        // Mark payment as cancelled and booking as cancelled
        paymentService.markPaymentCancelled(session.getId());
        bookingService.updateBookingStatus(bookingId, Booking.BookingStatus.CANCELLED);
    }

    /**
     * Handle subscription checkout session expired
     */
    private void handleSubscriptionCheckoutExpired(Session session) {
        Long userId = stripeUtil.extractUserId(session);
        String subscriptionType = stripeUtil.extractSubscriptionType(session);

        log.info("Subscription checkout session expired for user {} type {}: {}",
                 userId, subscriptionType, session.getId());

        // For subscription sessions, there's no booking to cancel
        // Just log the expiration - no subscription was created
        // No additional cleanup needed since no database records were created yet
    }
    
    /**
     * Handle payment intent succeeded event
     * This is the final confirmation that payment was processed successfully
     */
    @Transactional
    protected void handlePaymentIntentSucceeded(Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
        if (paymentIntent == null) {
            throw new StripeWebhookException("PaymentIntent object not found in payment_intent.succeeded event");
        }
        
        log.info("Payment intent succeeded: {} for amount {}", 
                 paymentIntent.getId(), paymentIntent.getAmount());
        
        // This event provides final confirmation - payment is definitely completed
        // The checkout.session.completed event already handled most of the processing
        // This is mainly for logging and any additional confirmation logic
    }
    
    /**
     * Handle payment intent failed event
     * This occurs when payment processing fails (e.g., card declined)
     */
    @Transactional
    protected void handlePaymentIntentFailed(Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
        if (paymentIntent == null) {
            throw new StripeWebhookException("PaymentIntent object not found in payment_intent.payment_failed event");
        }
        
        String failureReason = paymentIntent.getLastPaymentError() != null ? 
            paymentIntent.getLastPaymentError().getMessage() : "Payment failed";
            
        log.warn("Payment intent failed: {} - {}", paymentIntent.getId(), failureReason);
        
        // Mark payment as failed using payment intent ID
        String paymentIntentId = paymentIntent.getId();
        if (paymentIntentId != null) {
            paymentService.markPaymentFailed(paymentIntentId, failureReason);
        } else {
            log.warn("Payment intent ID not found for failed payment intent event");
        }
    }
    
    /**
     * Handle payment intent canceled event
     * This occurs when payment is explicitly canceled
     */
    @Transactional
    protected void handlePaymentIntentCanceled(Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
        if (paymentIntent == null) {
            throw new StripeWebhookException("PaymentIntent object not found in payment_intent.canceled event");
        }
        
        log.info("Payment intent canceled: {}", paymentIntent.getId());
        
        // This will be handled by session expiry or frontend polling
    }
    
    /**
     * Handle charge refunded event
     * This occurs when a refund is successfully processed
     */
    @Transactional
    protected void handleChargeRefunded(Event event) {
        Charge charge = (Charge) event.getDataObjectDeserializer().getObject().orElse(null);
        if (charge == null) {
            throw new StripeWebhookException("Charge object not found in charge.refunded event");
        }
        
        log.info("Charge refunded: {} for amount {}", charge.getId(), charge.getAmountRefunded());
        
        // Find payment by payment intent ID and update refund information
        String paymentIntentId = charge.getPaymentIntent();
        if (paymentIntentId != null) {
            paymentService.processRefundSuccess(paymentIntentId, charge.getAmountRefunded());
        } else {
            log.warn("Payment intent ID not found for refunded charge: {}", charge.getId());
        }
    }
    
    // ===================================================================
    // SUBSCRIPTION WEBHOOK HANDLERS
    // ===================================================================
    
    /**
     * Handle subscription created event
     * This occurs when user completes subscription checkout
     */
    @Transactional
    protected void handleSubscriptionCreated(Event event) {
        com.stripe.model.Subscription subscription = (com.stripe.model.Subscription) 
            event.getDataObjectDeserializer().getObject().orElse(null);
        if (subscription == null) {
            throw new StripeWebhookException("Subscription object not found in customer.subscription.created event");
        }
        
        // Extract subscription metadata and current period end
        SubscriptionUtil.SubscriptionMetadata metadata = SubscriptionUtil.extractSubscriptionMetadata(subscription);
        LocalDateTime currentPeriodEnd = SubscriptionUtil.extractCurrentPeriodEnd(subscription);
        
        // Create subscription record
        subscriptionService.processSubscriptionCreated(
            subscription.getId(),
            metadata.getUserId(),
            metadata.getSubscriptionType(),
            currentPeriodEnd
        );
        
        // Create payment record for initial subscription payment
        BigDecimal amount = SubscriptionUtil.getSubscriptionAmount(metadata.getSubscriptionType());
        
        // Use the subscription service to handle payment creation
        subscriptionService.processSubscriptionPaymentSuccess(
            subscription.getId(),
            amount,
            null // No payment intent ID available at subscription creation
        );
        
        log.info("Processed subscription created: {} for user {} type {}", 
                 subscription.getId(), metadata.getUserId(), metadata.getSubscriptionType());
    }
    
    /**
     * Handle subscription updated event
     * This occurs when subscription status changes (e.g., canceled)
     */
    @Transactional
    protected void handleSubscriptionUpdated(Event event) {
        com.stripe.model.Subscription subscription = (com.stripe.model.Subscription) 
            event.getDataObjectDeserializer().getObject().orElse(null);
        if (subscription == null) {
            throw new StripeWebhookException("Subscription object not found in customer.subscription.updated event");
        }
        
        // Map Stripe subscription status to our enum

        if (subscription.getCancelAtPeriodEnd()) {
            // Extract current period end from subscription
            LocalDateTime currentPeriodEnd = extractCurrentPeriodEnd(subscription);

            subscriptionService.processSubscriptionUpdated(
                    subscription.getId(),
                    Subscription.SubscriptionStatus.CANCELED,
                    currentPeriodEnd
            );

        }


        log.info("Processed subscription updated: {}", subscription.getId());
    }
    
    /**
     * Handle subscription deleted event
     * This occurs when subscription is canceled/expires
     */
    @Transactional
    protected void handleSubscriptionDeleted(Event event) {
        com.stripe.model.Subscription subscription = (com.stripe.model.Subscription) 
            event.getDataObjectDeserializer().getObject().orElse(null);
        if (subscription == null) {
            throw new StripeWebhookException("Subscription object not found in customer.subscription.deleted event");
        }
        
        subscriptionService.processSubscriptionDeleted(subscription.getId());
        
        log.info("Processed subscription deleted: {}", subscription.getId());
    }
    
    /**
     * Handle invoice payment succeeded event
     * This occurs when subscription payment is successful
     */
    @Transactional
    protected void handleInvoicePaymentSucceeded(Event event) {
        Invoice invoice = (Invoice) event.getDataObjectDeserializer().getObject().orElse(null);
        if (invoice == null) {
            throw new StripeWebhookException("Invoice object not found in invoice.payment_succeeded event");
        }

        // Only process subscription invoices using official line items approach
        String subscriptionId = null;
        
        // Check if invoice has subscription line items (official Stripe approach)
        if (invoice.getLines() != null && invoice.getLines().getData() != null) {
            for (com.stripe.model.InvoiceLineItem lineItem : invoice.getLines().getData()) {
                if (lineItem.getSubscription() != null) {
                    subscriptionId = lineItem.getSubscription();
                    break;
                }
            }
        }
        
        if (subscriptionId == null) {
            log.debug("Skipping non-subscription invoice payment: {}", invoice.getId());
        }


        BigDecimal amount = new BigDecimal(invoice.getAmountPaid())
            .divide(new BigDecimal(100), java.math.RoundingMode.HALF_UP); // Convert from cents to dollars

        // Payment intent ID - for now we'll pass null and rely on Stripe subscription ID
        // This is acceptable as the subscription service can work without payment intent ID
        subscriptionService.processSubscriptionPaymentSuccess(
            subscriptionId,
            amount,
            null
        );
        
        log.info("Processed subscription payment success: subscription {} amount {}", 
                 subscriptionId, amount);
    }
    
    /**
     * Handle invoice payment failed event
     * This occurs when subscription payment fails
     */
    @Transactional
    protected void handleInvoicePaymentFailed(Event event) {
        Invoice invoice = (Invoice) event.getDataObjectDeserializer().getObject().orElse(null);
        if (invoice == null) {
            throw new StripeWebhookException("Invoice object not found in invoice.payment_failed event");
        }
        
        // Only process subscription invoices using official line items approach
        String subscriptionId = null;
        
        // Check if invoice has subscription line items (official Stripe approach)
        if (invoice.getLines() != null && invoice.getLines().getData() != null) {
            for (com.stripe.model.InvoiceLineItem lineItem : invoice.getLines().getData()) {
                if (lineItem.getSubscription() != null) {
                    subscriptionId = lineItem.getSubscription();
                    break;
                }
            }
        }
        
        if (subscriptionId == null) {
            log.debug("Skipping non-subscription invoice payment failure: {}", invoice.getId());
            return;
        }
        
        String failureReason = "Payment failed";
        if (invoice.getLastFinalizationError() != null) {
            failureReason = invoice.getLastFinalizationError().getMessage();
        }
        
        subscriptionService.processSubscriptionPaymentFailed(
            subscriptionId,
            failureReason
        );
        
        log.warn("Processed subscription payment failure: subscription {} reason {}", 
                 subscriptionId, failureReason);
    }
    
    /**
     * Map Stripe subscription status to our internal enum
     */
    private Subscription.SubscriptionStatus mapStripeSubscriptionStatus(String stripeStatus) {
        switch (stripeStatus) {
            case "active":
                return Subscription.SubscriptionStatus.ACTIVE;
            case "canceled":
                return Subscription.SubscriptionStatus.CANCELED;
            case "past_due":
            case "unpaid":
            case "incomplete_expired":
                return Subscription.SubscriptionStatus.INACTIVE;
            case "incomplete":
            case "trialing":
            default:
                return Subscription.SubscriptionStatus.ACTIVE;
        }
    }
    
    /**
     * Get subscription amount based on type
     */
    private BigDecimal getSubscriptionAmount(Subscription.SubscriptionType subscriptionType) {
        return subscriptionType == Subscription.SubscriptionType.PREMIUM ? 
            new BigDecimal("9.99") : new BigDecimal("99.99");
    }
    
    /**
     * Extract current period end from Stripe subscription
     */
    private LocalDateTime extractCurrentPeriodEnd(com.stripe.model.Subscription subscription) {
        Long timestamp = subscription.getItems().getData().get(0).getCurrentPeriodEnd();
        return LocalDateTime.ofEpochSecond(timestamp, 0, ZoneOffset.UTC);
    }
}