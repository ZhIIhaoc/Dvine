package com.dvineservice.service.impl;

import com.dvinedao.domain.PendingTour;
import com.dvinedao.domain.PendingTourImage;
import com.dvinedao.mapper.PendingTourImageMapper;
import com.dvineservice.exception.NotFoundException;
import com.dvineservice.service.PendingTourImageService;
import com.dvineservice.service.PendingTourService;
import com.dvineservice.service.S3Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class PendingTourImageServiceImpl implements PendingTourImageService {
    
    @Autowired
    private PendingTourImageMapper pendingTourImageMapper;
    
    @Autowired
    private S3Service s3Service;
    
    @Autowired
    private PendingTourService pendingTourService;
    
    private static final String PENDING_TOUR_IMAGE_PREFIX = "pending-tours/";
    private static final List<String> SUPPORTED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );
    private static final long IMAGE_MAX_SIZE = 10 * 1024 * 1024; // 10MB
    private static final int MAX_IMAGES_PER_TOUR = 20;
    
    @Override
    @Transactional
    public List<String> uploadPendingTourImages(Long pendingTourId, MultipartFile[] files, boolean isPrimary, Long userId) {
        log.info("Starting to upload {} images for pending tour {}, user: {}", files.length, pendingTourId, userId);
        
        // Validate pending tour exists
        PendingTour pendingTour = pendingTourService.getPendingTourById(pendingTourId);
        if (pendingTour == null) {
            throw new NotFoundException("Pending tour not found");
        }
        
        // Validate files
        validateImageFiles(files, pendingTourId);
        
        List<String> uploadedUrls = new ArrayList<>();
        List<PendingTourImage> imagesToCreate = new ArrayList<>();
        
        // Upload files to S3 and prepare PendingTourImage objects
        for (int i = 0; i < files.length; i++) {
            MultipartFile file = files[i];
            String imageUrl = s3Service.uploadFile(pendingTourId, file, PENDING_TOUR_IMAGE_PREFIX);
            uploadedUrls.add(imageUrl);
            
            PendingTourImage image = new PendingTourImage();
            image.setPendingTourId(pendingTourId);
            image.setImageUrl(imageUrl);
            // Set first image as primary if isPrimary is true and no primary image exists
            image.setIsPrimary(isPrimary && i == 0 && !hasPrimaryImage(pendingTourId));
            
            imagesToCreate.add(image);
        }
        
        // Save images to database
        if (!imagesToCreate.isEmpty()) {
            pendingTourImageMapper.createImages(imagesToCreate);
        }
        
        log.info("Successfully uploaded {} images for pending tour {}", uploadedUrls.size(), pendingTourId);
        return uploadedUrls;
    }
    
    @Override
    public List<Map<String, Object>> getPendingTourImages(Long pendingTourId) {
        log.debug("Getting images for pending tour {}", pendingTourId);
        
        List<PendingTourImage> images = pendingTourImageMapper.findByPendingTourId(pendingTourId);
        
        return images.stream().map(image -> {
            Map<String, Object> imageInfo = new HashMap<>();
            imageInfo.put("imageId", image.getPendingImageId());
            imageInfo.put("imageUrl", image.getImageUrl());
            imageInfo.put("isPrimary", image.getIsPrimary());
            imageInfo.put("pendingTourId", image.getPendingTourId());
            return imageInfo;
        }).collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public void deletePendingTourImage(Long pendingTourId, Long imageId, Long userId) {
        log.info("Deleting image {} from pending tour {}, user: {}", imageId, pendingTourId, userId);
        
        // Validate pending tour exists
        PendingTour pendingTour = pendingTourService.getPendingTourById(pendingTourId);
        if (pendingTour == null) {
            throw new NotFoundException("Pending tour not found");
        }
        
        // Find the image
        List<PendingTourImage> images = pendingTourImageMapper.findByPendingTourId(pendingTourId);
        PendingTourImage imageToDelete = images.stream()
                .filter(img -> img.getPendingImageId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Image not found"));
        
        // Delete from S3
        s3Service.deleteFile(imageToDelete.getImageUrl());
        
        // Delete from database - we need to implement this method in mapper
        // For now, we'll delete all images for the pending tour and recreate without this one
        images.removeIf(img -> img.getPendingImageId().equals(imageId));
        pendingTourImageMapper.deleteByPendingTourId(pendingTourId);
        if (!images.isEmpty()) {
            pendingTourImageMapper.createImages(images);
        }
        
        log.info("Successfully deleted image {} from pending tour {}", imageId, pendingTourId);
    }
    
    @Override
    @Transactional
    public void updatePendingTourImage(Long pendingTourId, Long imageId, Boolean isPrimary, Long userId) {
        log.info("Updating image {} for pending tour {}, isPrimary: {}, user: {}", imageId, pendingTourId, isPrimary, userId);
        
        // Validate pending tour exists
        PendingTour pendingTour = pendingTourService.getPendingTourById(pendingTourId);
        if (pendingTour == null) {
            throw new NotFoundException("Pending tour not found");
        }
        
        // Find the image
        List<PendingTourImage> images = pendingTourImageMapper.findByPendingTourId(pendingTourId);
        PendingTourImage imageToUpdate = images.stream()
                .filter(img -> img.getPendingImageId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Image not found"));
        
        if (isPrimary != null) {
            if (isPrimary) {
                // Set all other images as non-primary first
                images.forEach(img -> {
                    if (!img.getPendingImageId().equals(imageId) && img.getIsPrimary()) {
                        img.setIsPrimary(false);
                    }
                });
            }
            
            imageToUpdate.setIsPrimary(isPrimary);
            
            // Update all images
            pendingTourImageMapper.deleteByPendingTourId(pendingTourId);
            pendingTourImageMapper.createImages(images);
        }
        
        log.info("Successfully updated image {} for pending tour {}", imageId, pendingTourId);
    }
    
    @Override
    @Transactional
    public String replacePrimaryImage(Long pendingTourId, MultipartFile file, Long userId) {
        log.info("Replacing primary image for pending tour {}, user: {}", pendingTourId, userId);
        
        // Validate pending tour exists
        PendingTour pendingTour = pendingTourService.getPendingTourById(pendingTourId);
        if (pendingTour == null) {
            throw new NotFoundException("Pending tour not found");
        }
        
        // Validate file
        validateImageFile(file);
        
        // Find current primary image
        List<PendingTourImage> images = pendingTourImageMapper.findByPendingTourId(pendingTourId);
        PendingTourImage currentPrimary = images.stream()
                .filter(PendingTourImage::getIsPrimary)
                .findFirst()
                .orElse(null);
        
        // Upload new image
        String newImageUrl = s3Service.uploadFile(pendingTourId, file, PENDING_TOUR_IMAGE_PREFIX);
        
        // Create new primary image
        PendingTourImage newPrimaryImage = new PendingTourImage();
        newPrimaryImage.setPendingTourId(pendingTourId);
        newPrimaryImage.setImageUrl(newImageUrl);
        newPrimaryImage.setIsPrimary(true);
        
        // Remove old primary and add new one
        if (currentPrimary != null) {
            s3Service.deleteFile(currentPrimary.getImageUrl());
            images.removeIf(img -> img.getPendingImageId().equals(currentPrimary.getPendingImageId()));
        }
        images.add(newPrimaryImage);
        
        // Update database
        pendingTourImageMapper.deleteByPendingTourId(pendingTourId);
        pendingTourImageMapper.createImages(images);
        
        log.info("Successfully replaced primary image for pending tour {}", pendingTourId);
        return newImageUrl;
    }
    
    @Override
    public boolean canModifyPendingTourImages(Long pendingTourId, Long userId) {
        try {
            PendingTour pendingTour = pendingTourService.getPendingTourById(pendingTourId);
            return pendingTour != null && pendingTour.getSubmittedBy().equals(userId);
        } catch (Exception e) {
            return false;
        }
    }
    
    private void validateImageFiles(MultipartFile[] files, Long pendingTourId) {
        if (files == null || files.length == 0) {
            throw new IllegalArgumentException("No files provided");
        }
        
        if (files.length > MAX_IMAGES_PER_TOUR) {
            throw new IllegalArgumentException("Cannot upload more than " + MAX_IMAGES_PER_TOUR + " images at once");
        }
        
        // Check current image count
        List<PendingTourImage> existingImages = pendingTourImageMapper.findByPendingTourId(pendingTourId);
        if (existingImages.size() + files.length > MAX_IMAGES_PER_TOUR) {
            throw new IllegalArgumentException("Pending tour cannot have more than " + MAX_IMAGES_PER_TOUR + " images in total");
        }
        
        for (MultipartFile file : files) {
            validateImageFile(file);
        }
    }
    
    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file cannot be empty");
        }
        
        if (file.getSize() > IMAGE_MAX_SIZE) {
            throw new IllegalArgumentException("Image file size cannot exceed 10MB");
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !SUPPORTED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Unsupported image file type, only supports: " + String.join(", ", SUPPORTED_IMAGE_TYPES));
        }
    }
    
    private boolean hasPrimaryImage(Long pendingTourId) {
        List<PendingTourImage> images = pendingTourImageMapper.findByPendingTourId(pendingTourId);
        return images.stream().anyMatch(PendingTourImage::getIsPrimary);
    }
}