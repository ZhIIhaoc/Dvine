package com.dvineapi.controller;

import com.dvinedao.annotation.PermissionCheck;
import com.dvinedao.domain.DevineMoment;
import com.dvinedao.domain.DevineMomentComment;
import com.dvinedao.domain.PermissionLevel;
import com.dvinedao.domain.ReturnResult;
import com.dvineservice.service.DevineMomentService;
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
@RequestMapping("/devine-moments")
@CrossOrigin
public class DevineMomentController {
    
    @Autowired
    private DevineMomentService devineMomentService;
    
    /**
     * Create a new Devine Moment
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PermissionCheck(PermissionLevel.REGULAR)
    public ReturnResult createMoment(@RequestBody DevineMoment moment) {
        try {
            Long userId = UserUtil.getCurrentUserId();
            moment.setUserId(userId);
            
            DevineMoment createdMoment = devineMomentService.createMoment(moment);
            
            Map<String, Object> result = new HashMap<>();
            result.put("momentId", createdMoment.getMomentId());
            result.put("message", "Devine moment created successfully");
            
            log.info("User {} created devine moment {}", userId, createdMoment.getMomentId());
            return ReturnResult.success(result);
        } catch (Exception e) {
            log.error("Failed to create devine moment", e);
            return ReturnResult.error("Failed to create devine moment: " + e.getMessage());
        }
    }
    
    /**
     * Upload images for a Devine Moment
     */
    @PostMapping("/{momentId}/images")
    @ResponseStatus(HttpStatus.OK)
    @PermissionCheck(PermissionLevel.REGULAR)
    public ReturnResult uploadMomentImages(
            @PathVariable Long momentId,
            @RequestParam("files") MultipartFile[] files) {
        try {
            Long userId = UserUtil.getCurrentUserId();
            
            List<String> imageUrls = devineMomentService.uploadMomentImages(momentId, files, userId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("momentId", momentId);
            result.put("imageUrls", imageUrls);
            result.put("message", "Images uploaded successfully");
            
            log.info("User {} uploaded {} images for moment {}", userId, imageUrls.size(), momentId);
            return ReturnResult.success(result);
        } catch (Exception e) {
            log.error("Failed to upload images for moment {}", momentId, e);
            return ReturnResult.error("Failed to upload images: " + e.getMessage());
        }
    }
    
    /**
     * Get all Devine Moments
     */
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    @PermissionCheck(PermissionLevel.REGULAR)
    public ReturnResult getAllMoments() {
        try {
            Long userId = UserUtil.getCurrentUserId();
            List<DevineMoment> moments = devineMomentService.getAllMoments(userId);
            
            log.info("User {} retrieved {} devine moments", userId, moments.size());
            return ReturnResult.success(moments);
        } catch (Exception e) {
            log.error("Failed to get all devine moments", e);
            return ReturnResult.error("Failed to get devine moments: " + e.getMessage());
        }
    }
    
    /**
     * Get a specific Devine Moment by ID
     */
    @GetMapping("/{momentId}")
    @ResponseStatus(HttpStatus.OK)
    @PermissionCheck(PermissionLevel.REGULAR)
    public ReturnResult getMomentById(@PathVariable Long momentId) {
        try {
            Long userId = UserUtil.getCurrentUserId();
            DevineMoment moment = devineMomentService.getMomentById(momentId, userId);
            
            log.info("User {} retrieved devine moment {}", userId, momentId);
            return ReturnResult.success(moment);
        } catch (Exception e) {
            log.error("Failed to get devine moment {}", momentId, e);
            return ReturnResult.error("Failed to get devine moment: " + e.getMessage());
        }
    }
    
    /**
     * Get Devine Moments by user ID
     */
    @GetMapping("/user/{userId}")
    @ResponseStatus(HttpStatus.OK)
    @PermissionCheck(PermissionLevel.REGULAR)
    public ReturnResult getMomentsByUserId(@PathVariable Long userId) {
        try {
            Long currentUserId = UserUtil.getCurrentUserId();
            List<DevineMoment> moments = devineMomentService.getMomentsByUserId(userId, currentUserId);
            
            log.info("User {} retrieved {} devine moments for user {}", currentUserId, moments.size(), userId);
            return ReturnResult.success(moments);
        } catch (Exception e) {
            log.error("Failed to get devine moments for user {}", userId, e);
            return ReturnResult.error("Failed to get devine moments: " + e.getMessage());
        }
    }
    
    /**
     * Delete a Devine Moment
     */
    @DeleteMapping("/{momentId}")
    @ResponseStatus(HttpStatus.OK)
    @PermissionCheck(PermissionLevel.REGULAR)
    public ReturnResult deleteMoment(@PathVariable Long momentId) {
        try {
            Long userId = UserUtil.getCurrentUserId();
            boolean deleted = devineMomentService.deleteMoment(momentId, userId);
            
            if (deleted) {
                log.info("User {} deleted devine moment {}", userId, momentId);
                return ReturnResult.success("Devine moment deleted successfully");
            } else {
                return ReturnResult.error("Failed to delete devine moment");
            }
        } catch (Exception e) {
            log.error("Failed to delete devine moment {}", momentId, e);
            return ReturnResult.error("Failed to delete devine moment: " + e.getMessage());
        }
    }
    
    /**
     * Toggle like/unlike for a Devine Moment
     */
    @PostMapping("/{momentId}/like")
    @ResponseStatus(HttpStatus.OK)
    @PermissionCheck(PermissionLevel.REGULAR)
    public ReturnResult toggleLike(@PathVariable Long momentId) {
        try {
            Long userId = UserUtil.getCurrentUserId();
            boolean liked = devineMomentService.toggleLike(momentId, userId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("momentId", momentId);
            result.put("liked", liked);
            result.put("message", liked ? "Moment liked successfully" : "Moment unliked successfully");
            
            log.info("User {} {} moment {}", userId, liked ? "liked" : "unliked", momentId);
            return ReturnResult.success(result);
        } catch (Exception e) {
            log.error("Failed to toggle like for moment {}", momentId, e);
            return ReturnResult.error("Failed to toggle like: " + e.getMessage());
        }
    }
    
    /**
     * Add a comment to a Devine Moment
     */
    @PostMapping("/{momentId}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    @PermissionCheck(PermissionLevel.REGULAR)
    public ReturnResult addComment(
            @PathVariable Long momentId,
            @RequestBody Map<String, String> request) {
        try {
            Long userId = UserUtil.getCurrentUserId();
            String content = request.get("content");
            
            if (content == null || content.trim().isEmpty()) {
                return ReturnResult.error("Comment content cannot be empty");
            }
            
            DevineMomentComment comment = new DevineMomentComment();
            comment.setMomentId(momentId);
            comment.setUserId(userId);
            comment.setContent(content.trim());
            
            DevineMomentComment createdComment = devineMomentService.addComment(comment);
            
            log.info("User {} added comment to moment {}", userId, momentId);
            return ReturnResult.success(createdComment);
        } catch (Exception e) {
            log.error("Failed to add comment to moment {}", momentId, e);
            return ReturnResult.error("Failed to add comment: " + e.getMessage());
        }
    }
    
    /**
     * Get comments for a Devine Moment
     */
    @GetMapping("/{momentId}/comments")
    @ResponseStatus(HttpStatus.OK)
    @PermissionCheck(PermissionLevel.REGULAR)
    public ReturnResult getComments(@PathVariable Long momentId) {
        try {
            List<DevineMomentComment> comments = devineMomentService.getCommentsByMomentId(momentId);
            
            log.info("Retrieved {} comments for moment {}", comments.size(), momentId);
            return ReturnResult.success(comments);
        } catch (Exception e) {
            log.error("Failed to get comments for moment {}", momentId, e);
            return ReturnResult.error("Failed to get comments: " + e.getMessage());
        }
    }
    
    /**
     * Delete a comment
     */
    @DeleteMapping("/comments/{commentId}")
    @ResponseStatus(HttpStatus.OK)
    @PermissionCheck(PermissionLevel.REGULAR)
    public ReturnResult deleteComment(@PathVariable Long commentId) {
        try {
            Long userId = UserUtil.getCurrentUserId();
            boolean deleted = devineMomentService.deleteComment(commentId, userId);
            
            if (deleted) {
                log.info("User {} deleted comment {}", userId, commentId);
                return ReturnResult.success("Comment deleted successfully");
            } else {
                return ReturnResult.error("Failed to delete comment");
            }
        } catch (Exception e) {
            log.error("Failed to delete comment {}", commentId, e);
            return ReturnResult.error("Failed to delete comment: " + e.getMessage());
        }
    }
}