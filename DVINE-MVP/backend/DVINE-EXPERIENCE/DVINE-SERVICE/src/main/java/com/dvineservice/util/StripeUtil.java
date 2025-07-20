package com.dvineservice.util;

import com.dvinedao.domain.Booking;
import com.dvinedao.domain.Tour;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.Refund;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.RefundCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;

/**
 * Utility class for Stripe integration operations.
 * Handles Stripe API calls and payment processing logic.
 */
@Component
@Slf4j
public class StripeUtil {
    
    @Value("${stripe.secret.key}")
    private String stripeSecretKey;
    
    @Value("${stripe.webhook.secret}")
    private String webhookSecret;
    
    @Value("${app.frontend.success-url:http://localhost:5173/booking/success}")
    private String successUrl;
    
    @Value("${app.frontend.cancel-url:http://localhost:5173/booking/cancel}")
    private String cancelUrl;
    
    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
        log.info("Stripe API initialized with secret key");
    }
    
    /**
     * Create dynamic line item for Stripe Checkout Session
     */
    public SessionCreateParams.LineItem createTourLineItem(Tour tour, BigDecimal price, Integer quantity) {
        return SessionCreateParams.LineItem.builder()
            .setPriceData(
                SessionCreateParams.LineItem.PriceData.builder()
                    .setCurrency("aud")
                    .setProductData(
                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                            .setName(tour.getTitle())
                            .setDescription("Tour Experience: " + tour.getDestination())
                            .putMetadata("tourId", tour.getTourId().toString())
                            .build()
                    )
                    .setUnitAmount(PaymentUtil.convertToStripeCents(price))
                    .build()
            )
            .setQuantity(quantity.longValue())
            .build();
    }
    
    /**
     * Create Stripe Checkout Session for tour booking
     * StripeException will be handled by GlobalExceptionHandler
     */
    public Session createBookingCheckoutSession(Booking booking, Tour tour, BigDecimal price) throws StripeException {
        // Handle null userId for guest bookings
        String userIdStr = booking.getUserId() != null ? booking.getUserId().toString() : "guest";
        
        SessionCreateParams params = SessionCreateParams.builder()
            .setMode(SessionCreateParams.Mode.PAYMENT)
            .setSuccessUrl(successUrl + "/" + booking.getBookingId())
            .setCancelUrl(cancelUrl + "/" + booking.getBookingId())
            .addLineItem(createTourLineItem(tour, price, booking.getQuantity()))
            .setExpiresAt(Instant.now().plus(30, ChronoUnit.MINUTES).getEpochSecond())
            .putMetadata("bookingId", booking.getBookingId().toString())
            .putMetadata("tourId", tour.getTourId().toString())
            .putMetadata("userId", userIdStr)
            .putMetadata("bookingReference", booking.getBookingReference())
            .build();
            
        Session session = Session.create(params);
        log.info("Created Stripe session {} for booking {}", session.getId(), booking.getBookingId());
        return session;
    }
    
    /**
     * Verify Stripe webhook signature
     * SignatureVerificationException will be handled by GlobalExceptionHandler
     */
    public Event constructWebhookEvent(String payload, String signature) throws SignatureVerificationException {
        log.info("Stripe webhook event received");
        log.info("webhookSecret: {}", webhookSecret);
        return Webhook.constructEvent(payload, signature, webhookSecret);
    }
    
    /**
     * Extract booking ID from Stripe session metadata
     */
    public Long extractBookingId(Session session) {
        Map<String, String> metadata = session.getMetadata();
        if (metadata == null || !metadata.containsKey("bookingId")) {
            throw new IllegalArgumentException("No bookingId found in Stripe session metadata");
        }
        
        String bookingIdStr = metadata.get("bookingId");
        if (bookingIdStr == null || bookingIdStr.trim().isEmpty()) {
            throw new IllegalArgumentException("Invalid bookingId in Stripe session metadata");
        }
        
        return Long.valueOf(bookingIdStr);
    }
    
    /**
     * Extract tour ID from Stripe session metadata
     */
    public Long extractTourId(Session session) {
        Map<String, String> metadata = session.getMetadata();
        if (metadata == null || !metadata.containsKey("tourId")) {
            throw new IllegalArgumentException("No tourId found in Stripe session metadata");
        }
        
        String tourIdStr = metadata.get("tourId");
        if (tourIdStr == null || tourIdStr.trim().isEmpty()) {
            throw new IllegalArgumentException("Invalid tourId in Stripe session metadata");
        }
        
        return Long.valueOf(tourIdStr);
    }
    
    /**
     * Process refund for a payment
     * StripeException will be handled by GlobalExceptionHandler
     */
    public Refund processRefund(String paymentIntentId, BigDecimal refundAmount) throws StripeException {
        RefundCreateParams params = RefundCreateParams.builder()
            .setPaymentIntent(paymentIntentId)
            .setAmount(PaymentUtil.convertToStripeCents(refundAmount))
            .build();
            
        Refund refund = Refund.create(params);
        log.info("Created refund {} for payment intent {} amount {}", 
                 refund.getId(), paymentIntentId, refundAmount);
        return refund;
    }
    
    /**
     * Check if Stripe session has expired
     */
    public boolean isSessionExpired(Session session) {
        if (session.getExpiresAt() == null) {
            return false;
        }
        return Instant.now().getEpochSecond() > session.getExpiresAt();
    }
}