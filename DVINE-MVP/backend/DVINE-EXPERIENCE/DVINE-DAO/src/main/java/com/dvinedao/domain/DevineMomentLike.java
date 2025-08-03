package com.dvinedao.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Likes made by users on devine moments.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DevineMomentLike {
    private Long likeId;
    private Long momentId;
    private Long userId;
    private LocalDateTime createTime;
}