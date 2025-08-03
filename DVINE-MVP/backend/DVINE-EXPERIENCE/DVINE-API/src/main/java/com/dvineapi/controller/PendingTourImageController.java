package com.dvineapi.controller;

import com.dvinedao.annotation.PermissionCheck;
import com.dvinedao.domain.PermissionLevel;
import com.dvinedao.domain.ReturnResult;
import com.dvineservice.service.PendingTourImageService;
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
@RequestMapping("/pending-tours")
@CrossOrigin
public class PendingTourImageController {
    
    @Autowired
    private PendingTourImageService pendingTourImageService;
    
    @PostMapping("/{pendingTourId}/images")
    @ResponseStatus(HttpStatus.OK)
    @PermissionCheck(PermissionLevel.PARTNER)
    public ReturnResult uploadPendingTourImages(
            @PathVariable Long pendingTourId,
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "isPrimary", required = false, defaultValue = "false") boolean isPrimary) {
        
        Long userId = UserUtil.getCurrentUserId();
        
        // Check if user has permission to modify this pending tour
        if (!pendingTourImageService.canModifyPendingTourImages(pendingTourId, userId)) {
            return ReturnResult.error("You can only upload images for your own pending tours");
        }
        
        List<String> imageUrls = pendingTourImageService.uploadPendingTourImages(pendingTourId, files, isPrimary, userId);
        
        Map<String, Object> result = new HashMap<>();
        result.put("pendingTourId", pendingTourId);
        result.put("imageUrls", imageUrls);
        result.put("message", "Pending tour images uploaded successfully");
        result.put("uploadedBy", userId);
        
        log.info("User {} uploaded {} images for pending tour {}", userId, imageUrls.size(), pendingTourId);
        return ReturnResult.success(result);
    }
    
    @GetMapping("/{pendingTourId}/images")
    @ResponseStatus(HttpStatus.OK)
    public ReturnResult getPendingTourImages(@PathVariable Long pendingTourId) {
        List<Map<String, Object>> images = pendingTourImageService.getPendingTourImages(pendingTourId);
        
        Map<String, Object> result = new HashMap<>();
        result.put("pendingTourId", pendingTourId);
        result.put("images", images);
        
        return ReturnResult.success(result);
    }
    
    @PutMapping("/{pendingTourId}/images/{imageId}")
    @ResponseStatus(HttpStatus.OK)
    @PermissionCheck(PermissionLevel.PARTNER)
    public ReturnResult updatePendingTourImage(
            @PathVariable Long pendingTourId,
            @PathVariable Long imageId,
            @RequestParam(value = "isPrimary", required = false) Boolean isPrimary) {
        
        Long userId = UserUtil.getCurrentUserId();
        
        // Check if user can modify this pending tour's images
        if (!pendingTourImageService.canModifyPendingTourImages(pendingTourId, userId)) {
            return ReturnResult.error("You can only modify images for your own pending tours");
        }
        
        pendingTourImageService.updatePendingTourImage(pendingTourId, imageId, isPrimary, userId);
        
        Map<String, Object> result = new HashMap<>();
        result.put("pendingTourId", pendingTourId);
        result.put("imageId", imageId);
        result.put("message", "Pending tour image updated successfully");
        result.put("updatedBy", userId);
        
        log.info("User {} updated image {} for pending tour {}", userId, imageId, pendingTourId);
        return ReturnResult.success(result);
    }
    
    @DeleteMapping("/{pendingTourId}/images/{imageId}")
    @ResponseStatus(HttpStatus.OK)
    @PermissionCheck(PermissionLevel.PARTNER)
    public ReturnResult deletePendingTourImage(
            @PathVariable Long pendingTourId,
            @PathVariable Long imageId) {
        
        Long userId = UserUtil.getCurrentUserId();
        
        // Check if user can modify this pending tour's images
        if (!pendingTourImageService.canModifyPendingTourImages(pendingTourId, userId)) {
            return ReturnResult.error("You can only delete images for your own pending tours");
        }
        
        pendingTourImageService.deletePendingTourImage(pendingTourId, imageId, userId);
        
        Map<String, Object> result = new HashMap<>();
        result.put("pendingTourId", pendingTourId);
        result.put("imageId", imageId);
        result.put("message", "Pending tour image deleted successfully");
        result.put("deletedBy", userId);
        
        log.info("User {} deleted image {} from pending tour {}", userId, imageId, pendingTourId);
        return ReturnResult.success(result);
    }
    
    @PostMapping("/{pendingTourId}/images/primary")
    @ResponseStatus(HttpStatus.OK)
    @PermissionCheck(PermissionLevel.PARTNER)
    public ReturnResult replacePrimaryImage(
            @PathVariable Long pendingTourId,
            @RequestParam("file") MultipartFile file) {
        
        Long userId = UserUtil.getCurrentUserId();
        
        // Check if user can modify this pending tour's images
        if (!pendingTourImageService.canModifyPendingTourImages(pendingTourId, userId)) {
            return ReturnResult.error("You can only replace images for your own pending tours");
        }
        
        String imageUrl = pendingTourImageService.replacePrimaryImage(pendingTourId, file, userId);
        
        Map<String, Object> result = new HashMap<>();
        result.put("pendingTourId", pendingTourId);
        result.put("primaryImageUrl", imageUrl);
        result.put("message", "Primary image replaced successfully");
        result.put("updatedBy", userId);
        
        log.info("User {} replaced primary image for pending tour {}", userId, pendingTourId);
        return ReturnResult.success(result);
    }
}