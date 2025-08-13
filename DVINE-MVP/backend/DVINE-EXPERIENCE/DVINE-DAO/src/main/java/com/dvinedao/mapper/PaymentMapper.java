package com.dvinedao.mapper;

import com.dvinedao.domain.Payment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * MyBatis mapper for payment operations.
 */
@Mapper
public interface PaymentMapper {
    
    /**
     * Create a new payment record (supports both booking and subscription payments)
     */
    void createPayment(Payment payment);
    
    /**
     * Find payment by ID
     */
    Payment findById(@Param("paymentId") Long paymentId);
    
    /**
     * Find payment by booking ID
     */
    Payment findByBookingId(@Param("bookingId") Long bookingId);
    
    /**
     * Find payment by Stripe session ID
     */
    Payment findByStripeSessionId(@Param("stripeSessionId") String stripeSessionId);
    
    /**
     * Find payment by Stripe payment intent ID
     */
    Payment findByStripePaymentIntentId(@Param("stripePaymentIntentId") String stripePaymentIntentId);
    
    /**
     * Update payment details
     */
    void updatePayment(Payment payment);
    
    /**
     * Find all payments for a user (through booking)
     */
    List<Payment> findByUserId(@Param("userId") Long userId);
    
    /**
     * Find payments by status
     */
    List<Payment> findByStatus(@Param("status") Payment.PaymentStatus status);
    
    /**
     * Count payments by status
     */
    Integer countByStatus(@Param("status") Payment.PaymentStatus status);
}