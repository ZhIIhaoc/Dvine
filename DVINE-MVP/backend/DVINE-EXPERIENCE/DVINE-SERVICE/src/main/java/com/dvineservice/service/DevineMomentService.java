package com.dvineservice.service;

import com.dvinedao.domain.DevineMoment;
import com.dvinedao.domain.DevineMomentComment;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Service interface for Devine Moment operations
 */
public interface DevineMomentService {
    
    /**
     * Create a new devine moment
     * @param moment the moment to create
     * @return the created moment
     */
    DevineMoment createMoment(DevineMoment moment);
    
    /**
     * Upload images for a devine moment
     * @param momentId the moment ID
     * @param files the image files to upload
     * @param userId the user ID
     * @return list of uploaded image URLs
     */
    List<String> uploadMomentImages(Long momentId, MultipartFile[] files, Long userId);
    
    /**
     * Get all devine moments
     * @param currentUserId the current user ID (for like status)
     * @return list of moments with user info and images
     */
    List<DevineMoment> getAllMoments(Long currentUserId);
    
    /**
     * Get a specific devine moment by ID
     * @param momentId the moment ID
     * @param currentUserId the current user ID (for like status)
     * @return the moment with user info and images
     */
    DevineMoment getMomentById(Long momentId, Long currentUserId);
    
    /**
     * Get devine moments by user ID
     * @param userId the user ID
     * @param currentUserId the current user ID (for like status)
     * @return list of moments by the user
     */
    List<DevineMoment> getMomentsByUserId(Long userId, Long currentUserId);
    
    /**
     * Delete a devine moment
     * @param momentId the moment ID
     * @param userId the user ID (must be owner)
     * @return true if deleted successfully
     */
    boolean deleteMoment(Long momentId, Long userId);
    
    /**
     * Like or unlike a devine moment
     * @param momentId the moment ID
     * @param userId the user ID
     * @return true if liked, false if unliked
     */
    boolean toggleLike(Long momentId, Long userId);
    
    /**
     * Add a comment to a devine moment
     * @param comment the comment to add
     * @return the created comment with user info
     */
    DevineMomentComment addComment(DevineMomentComment comment);
    
    /**
     * Get comments for a devine moment
     * @param momentId the moment ID
     * @return list of comments with user info
     */
    List<DevineMomentComment> getCommentsByMomentId(Long momentId);
    
    /**
     * Delete a comment
     * @param commentId the comment ID
     * @param userId the user ID (must be owner)
     * @return true if deleted successfully
     */
    boolean deleteComment(Long commentId, Long userId);
    
    /**
     * Check if a user can modify a moment (owner check)
     * @param momentId the moment ID
     * @param userId the user ID
     * @return true if user can modify, false otherwise
     */
    boolean canModifyMoment(Long momentId, Long userId);
}