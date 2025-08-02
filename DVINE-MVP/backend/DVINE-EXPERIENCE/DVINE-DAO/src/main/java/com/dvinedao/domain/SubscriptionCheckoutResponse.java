package com.dvinedao.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for subscription checkout session creation
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubscriptionCheckoutResponse {
    private String checkoutUrl;
    private String sessionId;
}