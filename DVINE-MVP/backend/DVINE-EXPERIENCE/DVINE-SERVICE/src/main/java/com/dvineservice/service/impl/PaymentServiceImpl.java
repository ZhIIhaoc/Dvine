package com.dvineservice.service.impl;

import com.dvinedao.annotation.PaymentOwnerCheck;
import com.dvinedao.annotation.UserOwnerCheck;
import com.dvinedao.domain.*;
import com.dvinedao.mapper.PaymentMapper;
import com.dvinedao.mapper.BookingMapper;
import com.dvineservice.service.PaymentService;
import com.dvineservice.util.PaymentUtil;
import com.dvineservice.util.StripeUtil;
import com.dvineservice.util.UserUtil;
import com.stripe.exception.StripeException;
import com.stripe.model.Refund;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Implementation of PaymentService for payment operations.
 */
@Service
@Transactional
@Slf4j
public class PaymentServiceImpl implements PaymentService {
    
    @Autowired
    private PaymentMapper paymentMapper;
    
    @Autowired
    private StripeUtil stripeUtil;

    @Autowired
    private BookingMapper bookingMapper;

// ===============================================================================
// Payment Operations
// ===============================================================================
    @Override
    @PaymentOwnerCheck
    public Payment getPaymentDetails(Long paymentId) {
        return paymentMapper.findById(paymentId);
    }
    
    @Override
    @PaymentOwnerCheck
    public Payment getPaymentByBookingId(Long bookingId) {
        return paymentMapper.findByBookingId(bookingId);
    }

    @Override
    @UserOwnerCheck
    public List<Payment> getUserPayments(Long userId) {
        return paymentMapper.findByUserId(userId);
    }

    @Override
    public List<Payment> getPaymentsByStatus(Payment.PaymentStatus status) {

        return paymentMapper.findByStatus(status);
    }
    
    @Override
    public List<Payment> getCurrentUserPayments() {
        Long currentUserId = UserUtil.getCurrentUserId();
        return paymentMapper.findByUserId(currentUserId);
    }

    @Override
    public void processRefund(Long paymentId, BigDecimal refundAmount) throws StripeException {
        Payment payment = paymentMapper.findById(paymentId);

        // Validate refund request using PaymentUtil
        PaymentUtil.validateRefundRequest(payment, refundAmount);

        // Process refund through Stripe - let webhook handle payment status update
        Refund stripeRefund = stripeUtil.processRefund(payment.getStripePaymentIntentId(), refundAmount);

        log.info("Initiated refund {} for payment {} via Stripe refund {} - awaiting webhook confirmation",
                refundAmount, paymentId, stripeRefund.getId());
    }

    @Override
    public PaymentStats getPaymentStats() {

        PaymentStats stats = new PaymentStats();
        // Get counts by status
        stats.totalPayments = (long) paymentMapper.countByStatus(null); // All payments
        stats.succeededPayments = (long) paymentMapper.countByStatus(Payment.PaymentStatus.SUCCEEDED);
        stats.failedPayments = (long) paymentMapper.countByStatus(Payment.PaymentStatus.FAILED);
        stats.pendingPayments = (long) paymentMapper.countByStatus(Payment.PaymentStatus.PENDING);

        // Calculate revenue and refunds from succeeded payments
        List<Payment> succeededPayments = paymentMapper.findByStatus(Payment.PaymentStatus.SUCCEEDED);
        
        // Calculate total refunds first
        stats.totalRefunds = succeededPayments.stream()
                .map(payment -> payment.getRefundAmount() != null ? payment.getRefundAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Calculate net revenue (total payment amounts minus refunds)
        BigDecimal totalGrossRevenue = succeededPayments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        stats.totalRevenue = totalGrossRevenue.subtract(stats.totalRefunds);

        return stats;
    }


// ===============================================================================
// Payment Lookup Operations
// ===============================================================================

    @Override
    public Payment getPaymentByStripeSessionId(String stripeSessionId) {
        Payment payment = paymentMapper.findByStripeSessionId(stripeSessionId);
        return PaymentUtil.requirePaymentBySession(payment, stripeSessionId);
    }
    
    @Override
    public Payment getPaymentByStripePaymentIntentId(String paymentIntentId) {
        Payment payment = paymentMapper.findByStripePaymentIntentId(paymentIntentId);
        return PaymentUtil.requirePaymentByIntent(payment, paymentIntentId);
    }

// ===============================================================================
// Payment Status Updates
// ===============================================================================


    @Override
    public void markPaymentSucceeded(String stripeSessionId, String paymentIntentId, String paymentMethod) {
        Payment payment = getPaymentByStripeSessionId(stripeSessionId);
        
        payment.setStatus(Payment.PaymentStatus.SUCCEEDED);
        payment.setStripePaymentIntentId(paymentIntentId);
        payment.setPaymentMethod(paymentMethod);
        payment.setPaidAt(LocalDateTime.now());
        payment.setFailureReason(null); // Clear any previous failure reason
        
        paymentMapper.updatePayment(payment);
        
        log.info("Marked payment {} as succeeded via session {}", payment.getPaymentId(), stripeSessionId);
    }

    @Override
    public void markPaymentFailed(String paymentIntentId, String failureReason) {
        Payment payment = getPaymentByStripePaymentIntentId(paymentIntentId);
        updatePaymentAsFailed(payment, failureReason, "via payment intent " + paymentIntentId);
    }
    
    @Override
    public void markPaymentCancelled(String stripeSessionId) {
        Payment payment = getPaymentByStripeSessionId(stripeSessionId);
        updatePaymentWithStatus(payment, Payment.PaymentStatus.CANCELLED, "via session " + stripeSessionId);
    }



    /**
     * Process successful refund confirmation from Stripe webhook
     * This is called when the webhook confirms the refund was successful
     * It updates payment of the refund amount and status
     *
     */
    @Override
    @Transactional
    public void processRefundSuccess(String paymentIntentId, Long refundAmountCents) {
        Payment payment = getPaymentByStripePaymentIntentId(paymentIntentId);
        
        // Convert cents to BigDecimal
        BigDecimal refundAmount = new BigDecimal(refundAmountCents).divide(new BigDecimal(100), 2, RoundingMode.HALF_UP);
        
        // Update payment record with refund information
        BigDecimal currentRefundAmount = payment.getRefundAmount() != null ? payment.getRefundAmount() : BigDecimal.ZERO;
        BigDecimal newRefundAmount = currentRefundAmount.add(refundAmount);
        payment.setRefundAmount(newRefundAmount);
        
        // If fully refunded, mark as refunded
        if (newRefundAmount.compareTo(payment.getAmount()) >= 0) {
            payment.setStatus(Payment.PaymentStatus.REFUNDED);
            if (payment.getBookingId() != null) {
                // If this payment was for a booking, update booking status to cancelled
                Booking booking = bookingMapper.findById(payment.getBookingId());
                if (booking != null) {
                    booking.setStatus(Booking.BookingStatus.CANCELLED);
                    bookingMapper.updateBooking(booking);
                    log.info("Updated booking {} status to CANCELLED due to full refund", booking.getBookingId());
                }
            }
        }
        
        paymentMapper.updatePayment(payment);
        
        log.info("Processed refund success for payment {} - amount {} via payment intent {}", 
                 payment.getPaymentId(), refundAmount, paymentIntentId);
    }
    
// ===============================================================================
// Private Helper Methods
// ===============================================================================
    
    /**
     * Helper method to update payment with status and save
     */
    private void updatePaymentWithStatus(Payment payment, Payment.PaymentStatus status, String logAction) {
        payment.setStatus(status);
        paymentMapper.updatePayment(payment);
        log.info("Marked payment {} as {} - {}", payment.getPaymentId(), status, logAction);
    }
    
    /**
     * Helper method to update payment with failed status and failure reason
     */
    private void updatePaymentAsFailed(Payment payment, String failureReason, String logAction) {
        payment.setStatus(Payment.PaymentStatus.FAILED);
        payment.setFailureReason(failureReason);
        paymentMapper.updatePayment(payment);
        log.warn("Marked payment {} as failed - {}: {}", payment.getPaymentId(), logAction, failureReason);
    }
    
}