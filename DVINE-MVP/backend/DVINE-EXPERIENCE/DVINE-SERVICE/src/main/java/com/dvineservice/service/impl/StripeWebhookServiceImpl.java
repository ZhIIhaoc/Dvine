package com.dvineservice.service.impl;

import com.dvinedao.domain.Booking;
import com.dvineservice.exception.StripeWebhookException;
import com.dvineservice.service.BookingService;
import com.dvineservice.service.PaymentService;
import com.dvineservice.service.StripeWebhookService;
import com.dvineservice.util.StripeUtil;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Charge;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.model.checkout.Session;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    @Override
    public void processWebhook(String payload, String signature) throws SignatureVerificationException {
        log.info("Processing Stripe webhook");
        
        // Verify webhook signature
        Event event = stripeUtil.constructWebhookEvent(payload, signature);
        
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
                
            default:
                log.info("Unhandled Stripe event type: {}", event.getType());
                break;
        }
        
        log.info("Successfully processed Stripe webhook event: {}", event.getType());
    }
    
    /**
     * Handle checkout session completed event
     * This occurs when user completes the Stripe checkout form
     */
    @Transactional
    protected void handleCheckoutSessionCompleted(Event event) {
        Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
        if (session == null) {
            throw new StripeWebhookException("Session object not found in checkout.session.completed event");
        }
        
        Long bookingId = stripeUtil.extractBookingId(session);
        log.info("Checkout session completed for booking {}: {}", bookingId, session.getId());
        
        // Update payment status to processing
        paymentService.markPaymentSucceeded(
            session.getId(),
            session.getPaymentIntent(),
            session.getPaymentMethodTypes().get(0) // Get first payment method
        );
        
        // Confirm the booking
        bookingService.confirmBooking(bookingId, session);
    }
    
    /**
     * Handle checkout session expired event
     * This occurs when user doesn't complete payment within the time limit
     */
    @Transactional
    protected void handleCheckoutSessionExpired(Event event) {
        Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
        if (session == null) {
            throw new StripeWebhookException("Session object not found in checkout.session.expired event");
        }
        
        Long bookingId = stripeUtil.extractBookingId(session);
        log.info("Checkout session expired for booking {}: {}", bookingId, session.getId());
        
        // Mark payment as cancelled and booking as cancelled
        paymentService.markPaymentCancelled(session.getId());
        bookingService.updateBookingStatus(bookingId, Booking.BookingStatus.CANCELLED);
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
}