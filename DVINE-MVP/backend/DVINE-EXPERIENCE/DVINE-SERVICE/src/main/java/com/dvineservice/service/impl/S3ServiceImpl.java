package com.dvineservice.service.impl;

import com.dvineservice.service.S3Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.Arrays;

@Slf4j
@Service
public class S3ServiceImpl implements S3Service {
    
    @Autowired
    private S3Client s3Client;
    
    @Value("${aws.s3.bucket-name}")
    private String bucketName;
    
    @Value("${aws.s3.region}")
    private String region;
    
    private static final String AVATAR_PREFIX = "avatars/";
    private static final String TOUR_IMAGE_PREFIX = "tours/";
    private static final String MOMENT_IMAGE_PREFIX = "moments/images/";
    private static final String MOMENT_VIDEO_PREFIX = "moments/videos/";
    
    // supported image types
    private static final List<String> SUPPORTED_IMAGE_TYPES = Arrays.asList(
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );
    
    // max size for avatar
    private static final long AVATAR_MAX_SIZE = 5 * 1024 * 1024;
    
    @Override
    public String uploadUserAvatar(Long userId, MultipartFile file) {
        validateAvatarFile(file);
        String fileKey = generateFileKey(AVATAR_PREFIX, userId, file.getOriginalFilename());
        return uploadFileToS3(fileKey, file);
    }

    @Override
    public String uploadFile(Long entityId, MultipartFile file, String fileType, String prefix) {
        String fileKey = generateFileKey(prefix, entityId, file.getOriginalFilename());
        return uploadFileToS3(fileKey, file);
    }
    
    @Override
    public boolean deleteFile(String fileUrl) {
        try {
            String fileKey = extractFileKeyFromUrl(fileUrl);
            if (fileKey == null) {
                log.error("file not found: {}", fileUrl);
                return false;
            }
            
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileKey)
                    .build();
            
            s3Client.deleteObject(deleteRequest);
            log.info("delete success: {}", fileKey);
            return true;
            
        } catch (Exception e) {
            log.error("delete failed: {}", fileUrl, e);
            return false;
        }
    }
    
    @Override
    public int deleteFiles(List<String> fileUrls) {
        int successCount = 0;
        for (String fileUrl : fileUrls) {
            if (deleteFile(fileUrl)) {
                successCount++;
            }
        }
        return successCount;
    }
    
    @Override
    public boolean fileExists(String fileUrl) {
        try {
            String fileKey = extractFileKeyFromUrl(fileUrl);
            if (fileKey == null) {
                return false;
            }
            
            HeadObjectRequest headRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileKey)
                    .build();
            
            s3Client.headObject(headRequest);
            return true;
            
        } catch (Exception e) {
            log.error("file not exist: {}", fileUrl, e);
            return false;
        }
    }
    
    private void validateAvatarFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("file is empty");
        }
        
        if (file.getSize() > AVATAR_MAX_SIZE) {
            throw new IllegalArgumentException("image size exceeds 5MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !SUPPORTED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("image file type not supported");
        }
    }

    private String getFilePrefixByType(String fileType) {
        return switch (fileType.toLowerCase()) {
            case "avatar" -> AVATAR_PREFIX;
            case "tour-image" -> TOUR_IMAGE_PREFIX;
            case "moment-image" -> MOMENT_IMAGE_PREFIX;
            case "moment-video" -> MOMENT_VIDEO_PREFIX;
            default -> "misc/";
        };
    }

    private String uploadFileToS3(String fileKey, MultipartFile file) {
        try {
            String contentType = file.getContentType();
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileKey)
                    .contentType(contentType)
                    .contentLength(file.getSize())
                    .build();
            
            s3Client.putObject(putRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            
            String fileUrl = String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, fileKey);
            log.info("file upload success: {}", fileUrl);
            return fileUrl;
            
        } catch (IOException e) {
            log.error("file load failed: {}", file.getOriginalFilename(), e);
            throw new RuntimeException("file load failed", e);
        } catch (Exception e) {
            log.error("failed upload to S3: {}", file.getOriginalFilename(), e);
            throw new RuntimeException("failed upload to S3", e);
        }
    }

    private String generateFileKey(String prefix, Long entityId, String originalFilename) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        String extension = getFileExtension(originalFilename);
        
        return String.format("%s%d/%s_%s%s", prefix, entityId, timestamp, uuid, extension);
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }

    private String extractFileKeyFromUrl(String fileUrl) {
        if (fileUrl == null || !fileUrl.contains(bucketName)) {
            return null;
        }
        
        // https://bucket-name.s3.region.amazonaws.com/file-key
        String pattern = String.format("https://%s.s3.%s.amazonaws.com/", bucketName, region);
        if (fileUrl.startsWith(pattern)) {
            return fileUrl.substring(pattern.length());
        }
        
        return null;
    }
}