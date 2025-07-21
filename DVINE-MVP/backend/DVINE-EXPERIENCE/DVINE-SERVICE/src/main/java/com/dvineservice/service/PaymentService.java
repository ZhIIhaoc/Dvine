package com.dvineservice.service;

import com.dvinedao.domain.Payment;
import com.stripe.exception.StripeException;

import java.math.BigDecimal;
import java.util.List;

/**
 * Service interface for payment operations.
 * Handles payment processing, status updates, and refunds.
 */
public interface PaymentService {
    
    /**
     * Get payment details by ID with permission checking
     */
    Payment getPaymentDetails(Long paymentId);
    
    /**
     * Get payment by booking ID
     */
    Payment getPaymentByBookingId(Long bookingId);
    
    /**
     * Get payment by Stripe session ID
     */
    Payment getPaymentByStripeSessionId(String stripeSessionId);
    
    /**
     * Get payment by Stripe payment intent ID
     */
    Payment getPaymentByStripePaymentIntentId(String paymentIntentId);
    
    /**
     * Get all payments for a user (admin function)
     */
    List<Payment> getUserPayments(Long userId);
    
    /**
     * Get current user's own payments
     */
    List<Payment> getCurrentUserPayments();
    
    /**
     * Get payments by status (admin only)
     */
    List<Payment> getPaymentsByStatus(Payment.PaymentStatus status);
    
    
    /**
     * Update payment with Stripe payment intent ID and mark as succeeded
     */
    void markPaymentSucceeded(String stripeSessionId, String paymentIntentId, String paymentMethod);
    
    /**
     * Mark payment as failed with reason using payment intent ID
     */
    void markPaymentFailed(String paymentIntentId, String failureReason);
    
    /**
     * Mark payment as cancelled (session expired)
     */
    void markPaymentCancelled(String stripeSessionId);
    
    /**
     * Process refund for a payment
     */
    void processRefund(Long paymentId, BigDecimal refundAmount) throws StripeException;
    
    /**
     * Process successful refund confirmation from webhook
     */
    void processRefundSuccess(String paymentIntentId, Long refundAmountCents);

    
    /**
     * Get payment statistics (admin only)
     */
    PaymentStats getPaymentStats();
    
    /**
     * Payment statistics DTO
     */
    class PaymentStats {
        public Long totalPayments;
        public Long succeededPayments;
        public Long failedPayments;
        public Long pendingPayments;
        public BigDecimal totalRevenue;
        public BigDecimal totalRefunds;
    }
}