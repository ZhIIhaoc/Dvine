package com.dvinedao.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * A moment is a user-generated post with content, images, and social features.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DevineMoment {
    private Long momentId;
    private Long userId;
    private String title;
    private String content;
    private String location; 
    private Integer likeCount;
    private Integer commentCount;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    
    // Additional fields for API responses
    private List<String> images;
    private String userNickName;
    private String userAvatar;
    private Boolean isLikedByCurrentUser;
}