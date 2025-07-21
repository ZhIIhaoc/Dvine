package com.dvinedao.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Represents a payment transaction entity in the system.
 * Tracks payment processing through Stripe and maintains audit trail.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Payment {
    private Long paymentId;
    private Long userId;
    private Long bookingId;
    private String stripeSessionId;
    private String stripePaymentIntentId;
    private BigDecimal amount;
    private String currency;
    private PaymentStatus status;
    private String paymentMethod;
    private String stripeCustomerId;
    private String failureReason;
    private BigDecimal refundAmount;
    private LocalDateTime paidAt;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    
    // Additional fields for joined queries
    private String bookingReference;
    private String userEmail;
    
    public enum PaymentStatus {
        PENDING, PROCESSING, SUCCEEDED, FAILED, CANCELLED, REFUNDED
    }
}