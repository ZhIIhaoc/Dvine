package com.dvinedao.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Comments made by users on devine moments.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DevineMomentComment {
    private Long commentId;
    private Long momentId;
    private Long userId;
    private String content;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    
    // Additional fields for API responses
    private String userNickName;
    private String userAvatar;
}