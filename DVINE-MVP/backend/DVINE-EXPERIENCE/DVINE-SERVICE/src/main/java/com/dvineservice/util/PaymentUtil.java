package com.dvineservice.util;

import com.dvinedao.domain.Booking;
import com.dvinedao.domain.Payment;
import com.dvinedao.domain.PermissionLevel;
import com.dvinedao.domain.Tour;
import com.dvinedao.domain.User;
import com.dvineservice.exception.PaymentFailedException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Utility class for payment-related operations and calculations.
 * Contains static methods for common payment processing tasks.
 */
@Component
@Slf4j
public class PaymentUtil {
    
    private static final SecureRandom RANDOM = new SecureRandom();
    
    /**
     * Generate unique booking reference in format: DVINE-YYYYMMDD-NNNN
     * Uses date + 4-digit random number to minimize collision risk
     */
    public static String generateBookingReference() {
        LocalDate now = LocalDate.now();
        String dateStr = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        
        // Generate random 4-digit number (0001-9999)
        int sequence = RANDOM.nextInt(9999) + 1;
        String sequenceStr = String.format("%04d", sequence);
        
        return "DVINE-" + dateStr + "-" + sequenceStr;
    }
    
    /**
     * Calculate total amount based on quantity and unit price
     */
    public static BigDecimal calculateTotalAmount(Integer quantity, BigDecimal unitPrice) {
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }
        if (unitPrice == null || unitPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Unit price must be positive");
        }
        return unitPrice.multiply(new BigDecimal(quantity)).setScale(2, RoundingMode.HALF_UP);
    }
    
    /**
     * Determine correct price based on user permission level
     */
    public static BigDecimal determineUserPrice(Tour tour, User user) {
        if (tour == null) {
            throw new IllegalArgumentException("Tour cannot be null");
        }
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        
        return user.getPermission() >= PermissionLevel.PREMIUM 
            ? tour.getPremiumPrice() 
            : tour.getRegularPrice();
    }
    
    /**
     * Convert amount to Stripe cents (Stripe requires integer cents)
     */
    public static Long convertToStripeCents(BigDecimal amount) {
        if (amount == null) {
            throw new IllegalArgumentException("Amount cannot be null");
        }
        return amount.multiply(new BigDecimal("100")).longValue();
    }
    
    /**
     * Convert Stripe cents back to decimal amount
     */
    public static BigDecimal convertFromStripeCents(Long cents) {
        if (cents == null) {
            throw new IllegalArgumentException("Cents cannot be null");
        }
        return new BigDecimal(cents).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
    }
    
    /**
     * Validate if travel date is bookable (not in past, within reasonable future)
     */
    public static boolean isValidTravelDate(LocalDate travelDate) {
        if (travelDate == null) {
            return false;
        }
        LocalDate now = LocalDate.now();
        LocalDate maxFuture = now.plusYears(2); // Max 2 years in advance
        return !travelDate.isBefore(now) && !travelDate.isAfter(maxFuture);
    }
    
    /**
     * Check if booking can be cancelled based on travel date
     */
    public static boolean isCancellationAllowed(LocalDate travelDate) {
        if (travelDate == null) {
            return false;
        }
        return travelDate.isAfter(LocalDate.now().plusDays(2)); // 48 hours notice
    }
    
    /**
     * Validate booking quantity is within acceptable range
     */
    public static boolean isValidQuantity(Integer quantity) {
        return quantity != null && quantity >= 1 && quantity <= 10;
    }
    
    /**
     * Create a new payment object for a booking
     */
    public static Payment createPayment(Booking booking) {
        Payment payment = new Payment();
        payment.setUserId(booking.getUserId());
        payment.setBookingId(booking.getBookingId());
        payment.setAmount(booking.getTotalAmount());
        payment.setCurrency(booking.getCurrency());
        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment.setRefundAmount(BigDecimal.ZERO);
        
        return payment;
    }
    
    /**
     * Create a new payment object for subscription (no booking)
     */
    public static Payment createSubscriptionPayment(Long userId, BigDecimal amount, String currency) {
        Payment payment = new Payment();
        payment.setUserId(userId);
        payment.setBookingId(null); // No booking for subscription payments
        payment.setAmount(amount);
        payment.setCurrency(currency);
        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment.setRefundAmount(BigDecimal.ZERO);
        
        return payment;
    }
    
    /**
     * Validate refund request for a payment
     * Checks payment status, payment intent availability, and refund amount limits
     */
    public static void validateRefundRequest(Payment payment, BigDecimal refundAmount) {
        if (payment == null) {
            throw new IllegalArgumentException("Payment cannot be null");
        }
        
        if (refundAmount == null) {
            throw new IllegalArgumentException("Refund amount cannot be null");
        }
        
        if (refundAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Refund amount must be positive");
        }
        
        // Check payment status - only succeeded payments can be refunded
        if (payment.getStatus() != Payment.PaymentStatus.SUCCEEDED) {
            throw new IllegalArgumentException("Can only refund succeeded payments. Current status: " + payment.getStatus());
        }
        
        // Check if Stripe payment intent ID exists for refund processing
        if (payment.getStripePaymentIntentId() == null || payment.getStripePaymentIntentId().trim().isEmpty()) {
            throw new IllegalArgumentException("Payment intent ID not found for refund");
        }
        
        // Calculate available refund amount (considering existing refunds)
        BigDecimal existingRefundAmount = payment.getRefundAmount() != null ? payment.getRefundAmount() : BigDecimal.ZERO;
        BigDecimal availableRefundAmount = payment.getAmount().subtract(existingRefundAmount);
        
        // Check if refund amount exceeds available amount
        if (refundAmount.compareTo(availableRefundAmount) > 0) {
            throw new IllegalArgumentException(
                String.format("Refund amount ($%.2f) cannot exceed available refund amount ($%.2f). " +
                             "Payment amount: $%.2f, Already refunded: $%.2f", 
                             refundAmount, availableRefundAmount, payment.getAmount(), existingRefundAmount)
            );
        }
        
        log.debug("Refund validation passed for payment {} - refund amount: {}, available: {}", 
                 payment.getPaymentId(), refundAmount, availableRefundAmount);
    }
    
    /**
     * Validate payment is not null and throw appropriate exception if it is
     */
    public static Payment requireNonNullPayment(Payment payment, String context) {
        if (payment == null) {
            throw new PaymentFailedException("Payment not found" + (context != null ? " " + context : ""));
        }
        return payment;
    }
    
    /**
     * Validate payment found by Stripe session ID
     */
    public static Payment requirePaymentBySession(Payment payment, String stripeSessionId) {
        if (payment == null) {
            throw new PaymentFailedException("Payment not found for session: " + stripeSessionId);
        }
        return payment;
    }
    
    /**
     * Validate payment found by Stripe payment intent ID
     */
    public static Payment requirePaymentByIntent(Payment payment, String paymentIntentId) {
        if (payment == null) {
            throw new PaymentFailedException("Payment not found for payment intent: " + paymentIntentId);
        }
        return payment;
    }
    
    /**
     * Validate payment found by payment ID
     */
    public static Payment requirePaymentById(Payment payment, Long paymentId) {
        if (payment == null) {
            throw new PaymentFailedException("Payment not found: " + paymentId);
        }
        return payment;
    }
}