package com.dvinedao.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents an image associated with a pending tour
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PendingTourImage {
    private Long pendingImageId;
    private Long pendingTourId;
    private String imageUrl;
    private Boolean isPrimary;
}