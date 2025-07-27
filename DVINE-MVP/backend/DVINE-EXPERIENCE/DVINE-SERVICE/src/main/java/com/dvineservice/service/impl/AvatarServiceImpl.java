package com.dvineservice.service.impl;

import com.dvineservice.service.AvatarService;
import com.dvineservice.service.S3Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

@Service
@Slf4j
public class AvatarServiceImpl implements AvatarService {

    @Autowired
    private S3Service s3Service;

    @Value("${aws.s3.default-avatar-url}")
    private String defaultAvatarUrl;
    
    private static final String AVATAR_PREFIX = "avatars/";
    private static final List<String> SUPPORTED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );
    private static final long AVATAR_MAX_SIZE = 5 * 1024 * 1024; // 5MB
    
    @Override
    public String uploadUserAvatar(Long userId, MultipartFile file) {
        log.info("Starting to upload user avatar, user ID: {}, file name: {}", userId, file.getOriginalFilename());
        
        // Validate avatar file
        validateAvatarFile(file);
        
        // Use S3Service to upload file
        String avatarUrl = s3Service.uploadFile(userId, file, AVATAR_PREFIX);
        
        log.info("User avatar upload successful, user ID: {}, avatar URL: {}", userId, avatarUrl);
        return avatarUrl;
    }
    
    @Override
    public boolean deleteUserAvatar(String avatarUrl) {
        if (isDefaultAvatar(avatarUrl)) {
            log.info("Skipping deletion of default avatar: {}", avatarUrl);
            return true;
        }
        
        log.info("Deleting user avatar: {}", avatarUrl);
        return s3Service.deleteFile(avatarUrl);
    }
    
    @Override
    public boolean isDefaultAvatar(String avatarUrl) {
        return avatarUrl == null || avatarUrl.isEmpty() || avatarUrl.contains("default");
    }
    
    @Override
    public String getDefaultAvatarUrl() {
        return defaultAvatarUrl;
    }

    private void validateAvatarFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Avatar file cannot be empty");
        }
        
        if (file.getSize() > AVATAR_MAX_SIZE) {
            throw new IllegalArgumentException("Avatar file size cannot exceed 5MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !SUPPORTED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Unsupported avatar file type, only supports: " + String.join(", ", SUPPORTED_IMAGE_TYPES));
        }
        
        log.debug("Avatar file validation passed, file size: {} bytes, file type: {}", file.getSize(), contentType);
    }
}