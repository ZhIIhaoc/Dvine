package com.dvinedao.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Images associated with devine moments.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DevineMomentImage {
    private Long imageId;
    private Long momentId;
    private String imageUrl;
    private Boolean isPrimary;
    private LocalDateTime createTime;
}