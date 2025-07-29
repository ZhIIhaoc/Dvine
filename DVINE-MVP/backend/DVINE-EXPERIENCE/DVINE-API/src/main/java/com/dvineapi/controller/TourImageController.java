package com.dvineapi.controller;

import com.dvinedao.annotation.PermissionCheck;
import com.dvinedao.annotation.TourOwnerCheck;
import com.dvinedao.domain.PermissionLevel;
import com.dvinedao.domain.ReturnResult;
import com.dvineservice.service.TourImageService;
import com.dvineservice.util.UserUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/tours")
@CrossOrigin
public class TourImageController {
    
    @Autowired
    private TourImageService tourImageService;

    /**
     * Upload images for a tour
     */
    @PostMapping("/{tourId}/images")
    @ResponseStatus(HttpStatus.OK)
    @PermissionCheck(PermissionLevel.PARTNER)
    @TourOwnerCheck
    public ReturnResult uploadTourImages(
            @PathVariable Long tourId,
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "isPrimary", required = false, defaultValue = "false") boolean isPrimary) {
        
        Long userId = UserUtil.getCurrentUserId();
        List<String> imageUrls = tourImageService.uploadTourImages(tourId, files, isPrimary, userId);
        
        Map<String, Object> result = new HashMap<>();
        result.put("tourId", tourId);
        result.put("imageUrls", imageUrls);
        result.put("message", "Tour images uploaded successfully");
        result.put("uploadedBy", userId);
        
        log.info("User {} uploaded {} images for tour {}", userId, imageUrls.size(), tourId);
        return ReturnResult.success(result);
    }

    /**
     * Get all images for a tour
     */
    @GetMapping("/{tourId}/images")
    @ResponseStatus(HttpStatus.OK)
    public ReturnResult getTourImages(@PathVariable Long tourId) {
        List<Map<String, Object>> images = tourImageService.getTourImages(tourId);
        
        Map<String, Object> result = new HashMap<>();
        result.put("tourId", tourId);
        result.put("images", images);
        
        return ReturnResult.success(result);
    }

    /**
     * Delete a specific image from a tour
     */
    @DeleteMapping("/{tourId}/images/{imageId}")
    @ResponseStatus(HttpStatus.OK)
    @PermissionCheck(PermissionLevel.PARTNER)
    @TourOwnerCheck
    public ReturnResult deleteTourImage(
            @PathVariable Long tourId,
            @PathVariable Long imageId) {
        
        Long userId = UserUtil.getCurrentUserId();
        tourImageService.deleteTourImage(tourId, imageId, userId);
        
        Map<String, Object> result = new HashMap<>();
        result.put("tourId", tourId);
        result.put("imageId", imageId);
        result.put("message", "Tour image deleted successfully");
        result.put("deletedBy", userId);
        
        log.info("User {} deleted image {} from tour {}", userId, imageId, tourId);
        return ReturnResult.success(result);
    }

    /**
     * Update image properties (e.g., set as primary)
     */
    @PutMapping("/{tourId}/images/{imageId}")
    @ResponseStatus(HttpStatus.OK)
    @PermissionCheck(PermissionLevel.PARTNER)
    @TourOwnerCheck
    public ReturnResult updateTourImage(
            @PathVariable Long tourId,
            @PathVariable Long imageId,
            @RequestParam(value = "isPrimary", required = false) Boolean isPrimary) {
        
        Long userId = UserUtil.getCurrentUserId();
        tourImageService.updateTourImage(tourId, imageId, isPrimary, userId);
        
        Map<String, Object> result = new HashMap<>();
        result.put("tourId", tourId);
        result.put("imageId", imageId);
        result.put("message", "Tour image updated successfully");
        result.put("updatedBy", userId);
        
        log.info("User {} updated image {} for tour {}", userId, imageId, tourId);
        return ReturnResult.success(result);
    }

    /**
     * Replace primary image for a tour
     */
    @PostMapping("/{tourId}/images/primary")
    @ResponseStatus(HttpStatus.OK)
    @PermissionCheck(PermissionLevel.PARTNER)
    @TourOwnerCheck
    public ReturnResult replacePrimaryImage(
            @PathVariable Long tourId,
            @RequestParam("file") MultipartFile file) {
        
        Long userId = UserUtil.getCurrentUserId();
        String imageUrl = tourImageService.replacePrimaryImage(tourId, file, userId);
        
        Map<String, Object> result = new HashMap<>();
        result.put("tourId", tourId);
        result.put("primaryImageUrl", imageUrl);
        result.put("message", "Primary image replaced successfully");
        result.put("updatedBy", userId);
        
        log.info("User {} replaced primary image for tour {}", userId, tourId);
        return ReturnResult.success(result);
    }
}