package com.dvineservice.service.impl;

import com.dvinedao.domain.Image;
import com.dvinedao.domain.Tour;
import com.dvinedao.mapper.ImageMapper;
import com.dvineservice.exception.NotFoundException;
import com.dvineservice.service.S3Service;
import com.dvineservice.service.TourImageService;
import com.dvineservice.service.TourOperationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class TourImageServiceImpl implements TourImageService {
    
    @Autowired
    private ImageMapper imageMapper;
    
    @Autowired
    private S3Service s3Service;
    
    @Autowired
    private TourOperationService tourOperationService;
    
    private static final String TOUR_IMAGE_PREFIX = "tours/";
    private static final List<String> SUPPORTED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );
    private static final long IMAGE_MAX_SIZE = 10 * 1024 * 1024; // 10MB
    private static final int MAX_IMAGES_PER_TOUR = 20;
    
    @Override
    @Transactional
    public List<String> uploadTourImages(Long tourId, MultipartFile[] files, boolean isPrimary, Long userId) {
        log.info("Starting to upload {} images for tour {}, user: {}", files.length, tourId, userId);
        
        // Validate tour exists
        Tour tour = tourOperationService.ensureTourExists(tourId);
        
        // Validate files
        validateImageFiles(files, tourId);
        
        List<String> uploadedUrls = new ArrayList<>();
        List<Image> imagesToCreate = new ArrayList<>();
        
        // Upload files to S3 and prepare Image objects
        for (int i = 0; i < files.length; i++) {
            MultipartFile file = files[i];
            String imageUrl = s3Service.uploadFile(tourId, file, TOUR_IMAGE_PREFIX);
            uploadedUrls.add(imageUrl);
            
            Image image = new Image();
            image.setTourId(tourId);
            image.setImageUrl(imageUrl);
            // Set first image as primary if isPrimary is true and no primary image exists
            image.setIsPrimary(isPrimary && i == 0 && !hasPrimaryImage(tourId));
            
            imagesToCreate.add(image);
        }
        
        // Save images to database
        if (!imagesToCreate.isEmpty()) {
            imageMapper.createImages(imagesToCreate);
        }
        
        log.info("Successfully uploaded {} images for tour {}", uploadedUrls.size(), tourId);
        return uploadedUrls;
    }
    
    @Override
    public List<Map<String, Object>> getTourImages(Long tourId) {
        log.debug("Getting images for tour {}", tourId);
        
        List<Image> images = imageMapper.findByTourId(tourId);
        
        return images.stream().map(image -> {
            Map<String, Object> imageInfo = new HashMap<>();
            imageInfo.put("imageId", image.getImageId());
            imageInfo.put("imageUrl", image.getImageUrl());
            imageInfo.put("isPrimary", image.getIsPrimary());
            imageInfo.put("tourId", image.getTourId());
            return imageInfo;
        }).collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public void deleteTourImage(Long tourId, Long imageId, Long userId) {
        log.info("Deleting image {} from tour {}, user: {}", imageId, tourId, userId);
        
        // Validate tour exists
        tourOperationService.ensureTourExists(tourId);
        
        // Find the image
        List<Image> images = imageMapper.findByTourId(tourId);
        Image imageToDelete = images.stream()
                .filter(img -> img.getImageId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Image not found"));
        
        // Delete from S3
        s3Service.deleteFile(imageToDelete.getImageUrl());
        
        // Delete from database
        imageMapper.deleteImages(List.of(imageId));
        
        log.info("Successfully deleted image {} from tour {}", imageId, tourId);
    }
    
    @Override
    @Transactional
    public void updateTourImage(Long tourId, Long imageId, Boolean isPrimary, Long userId) {
        log.info("Updating image {} for tour {}, isPrimary: {}, user: {}", imageId, tourId, isPrimary, userId);
        
        // Validate tour exists
        tourOperationService.ensureTourExists(tourId);
        
        // Find the image
        List<Image> images = imageMapper.findByTourId(tourId);
        Image imageToUpdate = images.stream()
                .filter(img -> img.getImageId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Image not found"));
        
        if (isPrimary != null) {
            if (isPrimary) {
                // Set all other images as non-primary first
                images.forEach(img -> {
                    if (!img.getImageId().equals(imageId) && img.getIsPrimary()) {
                        img.setIsPrimary(false);
                        updateImageInDatabase(img);
                    }
                });
            }
            
            imageToUpdate.setIsPrimary(isPrimary);
            updateImageInDatabase(imageToUpdate);
        }
        
        log.info("Successfully updated image {} for tour {}", imageId, tourId);
    }
    
    @Override
    @Transactional
    public String replacePrimaryImage(Long tourId, MultipartFile file, Long userId) {
        log.info("Replacing primary image for tour {}, user: {}", tourId, userId);
        
        // Validate tour exists
        Tour tour = tourOperationService.ensureTourExists(tourId);
        
        // Validate file
        validateImageFile(file);
        
        // Find current primary image
        List<Image> images = imageMapper.findByTourId(tourId);
        Image currentPrimary = images.stream()
                .filter(Image::getIsPrimary)
                .findFirst()
                .orElse(null);
        
        // Upload new image
        String newImageUrl = s3Service.uploadFile(tourId, file, TOUR_IMAGE_PREFIX);
        
        // Create new primary image
        Image newPrimaryImage = new Image();
        newPrimaryImage.setTourId(tourId);
        newPrimaryImage.setImageUrl(newImageUrl);
        newPrimaryImage.setIsPrimary(true);
        
        imageMapper.createImages(List.of(newPrimaryImage));
        
        // Delete old primary image if exists
        if (currentPrimary != null) {
            s3Service.deleteFile(currentPrimary.getImageUrl());
            imageMapper.deleteImages(List.of(currentPrimary.getImageId()));
        }
        
        log.info("Successfully replaced primary image for tour {}", tourId);
        return newImageUrl;
    }
    
    @Override
    public boolean canModifyTourImages(Long tourId, Long userId) {
        try {
            Tour tour = tourOperationService.findById(tourId);
            return tour.getCreatedBy().equals(userId);
        } catch (Exception e) {
            return false;
        }
    }
    
    private void validateImageFiles(MultipartFile[] files, Long tourId) {
        if (files == null || files.length == 0) {
            throw new IllegalArgumentException("No files provided");
        }
        
        if (files.length > MAX_IMAGES_PER_TOUR) {
            throw new IllegalArgumentException("Cannot upload more than " + MAX_IMAGES_PER_TOUR + " images at once");
        }
        
        // Check current image count
        List<Image> existingImages = imageMapper.findByTourId(tourId);
        if (existingImages.size() + files.length > MAX_IMAGES_PER_TOUR) {
            throw new IllegalArgumentException("Tour cannot have more than " + MAX_IMAGES_PER_TOUR + " images in total");
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
    
    private boolean hasPrimaryImage(Long tourId) {
        List<Image> images = imageMapper.findByTourId(tourId);
        return images.stream().anyMatch(Image::getIsPrimary);
    }
    
    private void updateImageInDatabase(Image image) {
        imageMapper.updateImage(image);
    }
}