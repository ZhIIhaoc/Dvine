package com.dvineservice.util;

import com.dvinedao.domain.Booking;
import com.dvinedao.domain.Tour;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.Price;
import com.stripe.model.PriceCollection;
import com.stripe.model.Product;
import com.stripe.model.ProductCollection;
import com.stripe.model.Refund;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.PriceCreateParams;
import com.stripe.param.PriceListParams;
import com.stripe.param.ProductCreateParams;
import com.stripe.param.ProductListParams;
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
    
    @Value("${app.frontend.success-url}")
    private String successUrl;
    
    @Value("${app.frontend.cancel-url}")
    private String cancelUrl;
    
    @Value("${app.frontend.subscription-success-url}")
    private String subscriptionSuccessUrl;
    
    @Value("${app.frontend.subscription-cancel-url}")
    private String subscriptionCancelUrl;

    // Subscription product and price IDs (will be created/stored programmatically)
    private String premiumProductId;
    private String premiumPriceId;
    private String partnerProductId;
    private String partnerPriceId;
    
    @PostConstruct
    public void init() throws StripeException {
        Stripe.apiKey = stripeSecretKey;
        log.info("Stripe API initialized with secret key");
        // Initialize subscription products
        initializeSubscriptionProducts();
        log.info("StripeUtil initialized with products: Premium {}, Partner {}",
                 premiumProductId, partnerProductId);
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
    
    // ===================================================================
    // SUBSCRIPTION INITIALIZATION
    // ===================================================================
    
    /**
     * Initialize subscription products and prices on startup
     * Creates products/prices if they don't exist
     */
    public void initializeSubscriptionProducts() throws StripeException {
        initPremiumSubscription();
        initPartnerSubscription();
        log.info("Subscription products initialized - Premium: {}, Partner: {}", 
                 premiumPriceId, partnerPriceId);
    }
    
    /**
     * Find existing Stripe product by metadata type
     */
    private Product findExistingProduct(String metadataType) throws StripeException {
        ProductListParams params = ProductListParams.builder()
            .setActive(true)
            .setLimit(100L)
            .build();
            
        ProductCollection products = Product.list(params);
        
        for (Product product : products.getData()) {
            if (product.getMetadata() != null && 
                metadataType.equals(product.getMetadata().get("type"))) {
                log.info("Found existing {} product: {}", metadataType, product.getId());
                return product;
            }
        }
        
        return null;
    }
    
    /**
     * Find existing Stripe price for a product with specific interval
     */
    private Price findExistingPrice(String productId, PriceCreateParams.Recurring.Interval interval, Long unitAmount) throws StripeException {
        PriceListParams params = PriceListParams.builder()
            .setProduct(productId)
            .setActive(true)
            .setLimit(100L)
            .build();
            
        PriceCollection prices = Price.list(params);
        
        for (Price price : prices.getData()) {
            if (price.getRecurring() != null && 
                interval.getValue().equals(price.getRecurring().getInterval()) &&
                unitAmount.equals(price.getUnitAmount())) {
                log.info("Found existing price for product {}: {}", productId, price.getId());
                return price;
            }
        }
        
        return null;
    }

    /**
     * Create or retrieve Premium subscription product and price
     */
    private void initPremiumSubscription() throws StripeException {
        final Long PREMIUM_UNIT_AMOUNT = 999L; // $9.99 in cents
        final PriceCreateParams.Recurring.Interval PREMIUM_INTERVAL = PriceCreateParams.Recurring.Interval.MONTH;
        
        // Try to find existing Premium product
        Product product = findExistingProduct("premium");
        
        if (product == null) {
            // Create new Premium Product
            ProductCreateParams productParams = ProductCreateParams.builder()
                .setName("Premium Membership")
                .setDescription("Discounted tour prices and exclusive premium access")
                .putMetadata("type", "premium")
                .build();
            
            product = Product.create(productParams);
            log.info("Created new Premium product: {}", product.getId());
        }

        this.premiumProductId = product.getId();
        
        // Try to find existing Premium price
        Price price = findExistingPrice(premiumProductId, PREMIUM_INTERVAL, PREMIUM_UNIT_AMOUNT);
        
        if (price == null) {
            // Create new Premium Price ($9.99/month)
            PriceCreateParams priceParams = PriceCreateParams.builder()
                .setProduct(premiumProductId)
                .setCurrency("aud")
                .setUnitAmount(PREMIUM_UNIT_AMOUNT)
                .setRecurring(
                    PriceCreateParams.Recurring.builder()
                        .setInterval(PREMIUM_INTERVAL)
                        .build()
                )
                .build();
                
            price = Price.create(priceParams);
            log.info("Created new Premium price: {}", price.getId());
        }
        
        this.premiumPriceId = price.getId();
    }
    
    /**
     * Create or retrieve Partner subscription product and price
     */
    private void initPartnerSubscription() throws StripeException {
        final Long PARTNER_UNIT_AMOUNT = 9999L; // $99.99 in cents
        final PriceCreateParams.Recurring.Interval PARTNER_INTERVAL = PriceCreateParams.Recurring.Interval.WEEK;
        
        // Try to find existing Partner product
        Product product = findExistingProduct("partner");
        
        if (product == null) {
            // Create new Partner Product
            ProductCreateParams productParams = ProductCreateParams.builder()
                .setName("Partner Subscription")
                .setDescription("Full partner access to create and manage tours with dashboard access")
                .putMetadata("type", "partner")
                .build();
            
            product = Product.create(productParams);
            log.info("Created new Partner product: {}", product.getId());
        }

        this.partnerProductId = product.getId();
        
        // Try to find existing Partner price
        Price price = findExistingPrice(partnerProductId, PARTNER_INTERVAL, PARTNER_UNIT_AMOUNT);
        
        if (price == null) {
            // Create new Partner Price ($99.99/week)
            PriceCreateParams priceParams = PriceCreateParams.builder()
                .setProduct(partnerProductId)
                .setCurrency("aud")
                .setUnitAmount(PARTNER_UNIT_AMOUNT)
                .setRecurring(
                    PriceCreateParams.Recurring.builder()
                        .setInterval(PARTNER_INTERVAL)
                        .build()
                )
                .build();
                
            price = Price.create(priceParams);
            log.info("Created new Partner price: {}", price.getId());
        }
        
        this.partnerPriceId = price.getId();
    }


    // ===================================================================
    // SUBSCRIPTION OPERATIONS
    // ===================================================================
    
    /**
     * Create Stripe Checkout Session for subscription
     */
    public Session createSubscriptionCheckoutSession(Long userId, String subscriptionType) throws StripeException {
        String priceId = subscriptionType.equals("PREMIUM") ? premiumPriceId : partnerPriceId;
        
        SessionCreateParams params = SessionCreateParams.builder()
            .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
            .setSuccessUrl(subscriptionSuccessUrl)
            .setCancelUrl(subscriptionCancelUrl)
            .addLineItem(
                SessionCreateParams.LineItem.builder()
                    .setPrice(priceId)
                    .setQuantity(1L)
                    .build()
            )
            .putMetadata("userId", userId.toString())
            .putMetadata("subscriptionType", subscriptionType)
            .setSubscriptionData(
                SessionCreateParams.SubscriptionData.builder()
                    .putMetadata("userId",      userId.toString())
                    .putMetadata("subscriptionType", subscriptionType)
                    .build()
            )
            .build();
            
        Session session = Session.create(params);
        log.info("Created subscription checkout session {} for user {} type {}", 
                 session.getId(), userId, subscriptionType);
        return session;
    }

    // ====================================================================
    // METADATA EXTRACTION
    // ====================================================================
    
    /**
     * Extract user ID from Stripe session metadata
     */
    public Long extractUserId(Session session) {
        Map<String, String> metadata = session.getMetadata();
        if (metadata == null || !metadata.containsKey("userId")) {
            throw new IllegalArgumentException("No userId found in Stripe session metadata");
        }
        
        String userIdStr = metadata.get("userId");
        if (userIdStr == null || userIdStr.trim().isEmpty()) {
            throw new IllegalArgumentException("Invalid userId in Stripe session metadata");
        }
        
        return Long.valueOf(userIdStr);
    }
    
    /**
     * Extract subscription type from Stripe session metadata
     */
    public String extractSubscriptionType(Session session) {
        Map<String, String> metadata = session.getMetadata();
        if (metadata == null || !metadata.containsKey("subscriptionType")) {
            throw new IllegalArgumentException("No subscriptionType found in Stripe session metadata");
        }
        
        return metadata.get("subscriptionType");
    }
}