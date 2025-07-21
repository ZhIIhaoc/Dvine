package com.dvinedao.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for booking session creation.
 * Contains the information needed to redirect user to Stripe checkout.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingSessionResponse {
    private Long bookingId;
    private String bookingReference;
    private String checkoutUrl;
}