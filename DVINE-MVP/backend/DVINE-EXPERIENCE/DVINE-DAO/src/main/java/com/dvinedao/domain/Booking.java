package com.dvinedao.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Represents a tour booking entity in the system.
 * Contains booking details including user, tour, pricing, and travel information.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Booking {
    private Long bookingId;
    private Long userId;
    private Long tourId;
    private String bookingReference;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalAmount;
    private String currency;
    private LocalDate travelDate;
    private BookingStatus status;
    private String customerNotes;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    
    // Additional fields for joined queries
    private String userEmail;
    private String userName;
    private String tourTitle;
    private String tourDestination;
    
    public enum BookingStatus {
        PENDING, CONFIRMED, CANCELLED, COMPLETED
    }
}