package com.dvineapi.controller;

import com.dvinedao.annotation.PermissionCheck;
import com.dvinedao.domain.Payment;
import com.dvinedao.domain.PermissionLevel;
import com.dvinedao.domain.ReturnResult;
import com.dvineservice.service.PaymentService;
import com.stripe.exception.StripeException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * REST controller for payment operations.
 * Handles payment details, history, and refund processing.
 */
@RestController
@RequestMapping("/payments")
@Slf4j
public class PaymentController {
    
    @Autowired
    private PaymentService paymentService;
    
    /**
     * Get payment details by ID
     */
    @GetMapping("/{paymentId}")
    @ResponseStatus(HttpStatus.OK)
    public ReturnResult getPaymentDetails(@PathVariable Long paymentId) {
        log.info("Getting payment details for {}", paymentId);
        
        Payment payment = paymentService.getPaymentDetails(paymentId);
        return ReturnResult.success(payment);
    }
    
    /**
     * Get payment by booking ID
     */
    @GetMapping("/booking/{bookingId}")
    @ResponseStatus(HttpStatus.OK)
    public ReturnResult getPaymentByBookingId(@PathVariable Long bookingId) {
        log.info("Getting payment for booking {}", bookingId);
        
        Payment payment = paymentService.getPaymentByBookingId(bookingId);
        return ReturnResult.success(payment);
    }
    
    /**
     * Get all payments for a user (admin endpoint)
     */
    @GetMapping("/user/{userId}")
    @ResponseStatus(HttpStatus.OK)
    @PermissionCheck(PermissionLevel.MANAGER)
    public ReturnResult getUserPayments(@PathVariable Long userId) {
        log.info("Getting payments for user {}", userId);
        
        List<Payment> payments = paymentService.getUserPayments(userId);
        return ReturnResult.success(payments);
    }
    
    /**
     * Get current user's own payments
     */
    @GetMapping("/my-payments")
    @ResponseStatus(HttpStatus.OK)
    public ReturnResult getMyPayments() {
        log.info("Getting payments for current user");
        
        List<Payment> payments = paymentService.getCurrentUserPayments();
        return ReturnResult.success(payments);
    }
    
    /**
     * Get payments by status (admin only)
     */
    @GetMapping("/status/{status}")
    @ResponseStatus(HttpStatus.OK)
    @PermissionCheck(PermissionLevel.MANAGER)
    public ReturnResult getPaymentsByStatus(@PathVariable Payment.PaymentStatus status) {
        log.info("Getting payments with status {}", status);
        
        List<Payment> payments = paymentService.getPaymentsByStatus(status);
        return ReturnResult.success(payments);
    }
    
    /**
     * Process manual refund for a payment
     */
    @PostMapping("/{paymentId}/refund")
    @ResponseStatus(HttpStatus.OK)
    @PermissionCheck(PermissionLevel.MANAGER)
    public ReturnResult processRefund(@PathVariable Long paymentId, 
                                     @RequestParam BigDecimal refundAmount) throws StripeException {
        log.info("Processing refund for payment {} amount {}", paymentId, refundAmount);
        
        paymentService.processRefund(paymentId, refundAmount);
        return ReturnResult.success();
    }
    
    /**
     * Get payment statistics (admin only)
     */
    @GetMapping("/admin/stats")
    @ResponseStatus(HttpStatus.OK)
    @PermissionCheck(PermissionLevel.MANAGER)
    public ReturnResult getPaymentStats() {
        log.info("Getting payment statistics");
        
        PaymentService.PaymentStats stats = paymentService.getPaymentStats();
        return ReturnResult.success(stats);
    }
}