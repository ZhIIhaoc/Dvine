package com.dvineservice.service;

import org.springframework.web.multipart.MultipartFile;

public interface AvatarService {
    String uploadUserAvatar(Long userId, MultipartFile file);
    boolean deleteUserAvatar(String avatarUrl);
    boolean isDefaultAvatar(String avatarUrl);
    String getDefaultAvatarUrl();
}