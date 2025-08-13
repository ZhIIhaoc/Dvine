package com.dvineservice.service.impl;

import com.dvinedao.domain.DevineMoment;
import com.dvinedao.domain.DevineMomentComment;
import com.dvinedao.domain.DevineMomentImage;
import com.dvinedao.domain.DevineMomentLike;
import com.dvinedao.mapper.DevineMomentCommentMapper;
import com.dvinedao.mapper.DevineMomentImageMapper;
import com.dvinedao.mapper.DevineMomentLikeMapper;
import com.dvinedao.mapper.DevineMomentMapper;
import com.dvineservice.exception.NotFoundException;
import com.dvineservice.exception.PermissionDeniedException;
import com.dvineservice.service.DevineMomentService;
import com.dvineservice.service.S3Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class DevineMomentServiceImpl implements DevineMomentService {
    
    @Autowired
    private DevineMomentMapper devineMomentMapper;
    
    @Autowired
    private DevineMomentImageMapper devineMomentImageMapper;
    
    @Autowired
    private DevineMomentCommentMapper devineMomentCommentMapper;
    
    @Autowired
    private DevineMomentLikeMapper devineMomentLikeMapper;
    
    @Autowired
    private S3Service s3Service;
    
    @Override
    @Transactional
    public DevineMoment createMoment(DevineMoment moment) {
        // Insert the moment
        int result = devineMomentMapper.insertMoment(moment);
        if (result <= 0) {
            throw new RuntimeException("Failed to create devine moment");
        }
        
        log.info("Successfully created devine moment with ID: {}", moment.getMomentId());
        return moment;
    }
    
    @Override
    @Transactional
    public List<String> uploadMomentImages(Long momentId, MultipartFile[] files, Long userId) {
        // Check if moment exists and user owns it
        if (!canModifyMoment(momentId, userId)) {
            throw new PermissionDeniedException("You can only upload images for your own moments");
        }
        
        List<String> imageUrls = new ArrayList<>();
        
        for (int i = 0; i < files.length; i++) {
            MultipartFile file = files[i];
            try {
                // Upload to S3
                String imageUrl = s3Service.uploadFile(momentId, file, "moments/");
                
                // Save to database
                DevineMomentImage image = new DevineMomentImage();
                image.setMomentId(momentId);
                image.setImageUrl(imageUrl);
                image.setIsPrimary(i == 0); // First image is primary
                
                devineMomentImageMapper.insertImage(image);
                imageUrls.add(imageUrl);
                
                log.info("Successfully uploaded image: {}", imageUrl);
            } catch (Exception e) {
                log.error("Failed to upload image for moment: {}", momentId, e);
                throw new RuntimeException("Failed to upload image: " + e.getMessage());
            }
        }
        
        return imageUrls;
    }
    
    @Override
    public List<DevineMoment> getAllMoments(Long currentUserId) {
        List<DevineMoment> moments = devineMomentMapper.findAllMomentsWithUserInfo(currentUserId);
        
        // Load images for each moment
        for (DevineMoment moment : moments) {
            List<String> images = devineMomentImageMapper.findImageUrlsByMomentId(moment.getMomentId());
            moment.setImages(images);
        }
        
        return moments;
    }
    
    @Override
    public DevineMoment getMomentById(Long momentId, Long currentUserId) {
        DevineMoment moment = devineMomentMapper.findMomentByIdWithUserInfo(momentId, currentUserId);
        if (moment == null) {
            throw new NotFoundException("Devine moment not found");
        }
        
        // Load images
        List<String> images = devineMomentImageMapper.findImageUrlsByMomentId(momentId);
        moment.setImages(images);
        
        return moment;
    }
    
    @Override
    public List<DevineMoment> getMomentsByUserId(Long userId, Long currentUserId) {
        List<DevineMoment> moments = devineMomentMapper.findMomentsByUserId(userId, currentUserId);
        
        // Load images for each moment
        for (DevineMoment moment : moments) {
            List<String> images = devineMomentImageMapper.findImageUrlsByMomentId(moment.getMomentId());
            moment.setImages(images);
        }
        
        return moments;
    }
    
    @Override
    @Transactional
    public boolean deleteMoment(Long momentId, Long userId) {
        // Check if user owns the moment
        if (!canModifyMoment(momentId, userId)) {
            throw new PermissionDeniedException("You can only delete your own moments");
        }
        
        // Delete associated data (images, comments, likes) - handled by CASCADE
        int result = devineMomentMapper.deleteMoment(momentId);
        
        if (result > 0) {
            log.info("Successfully deleted devine moment: {}", momentId);
            return true;
        }
        
        return false;
    }
    
    @Override
    @Transactional
    public boolean toggleLike(Long momentId, Long userId) {
        // Check if moment exists
        if (!devineMomentMapper.existsById(momentId)) {
            throw new NotFoundException("Devine moment not found");
        }
        
        // Check if user has already liked the moment
        boolean hasLiked = devineMomentLikeMapper.hasUserLikedMoment(momentId, userId);
        
        if (hasLiked) {
            // Unlike the moment
            devineMomentLikeMapper.deleteLike(momentId, userId);
            devineMomentMapper.updateLikeCount(momentId, -1);
            log.info("User {} unliked moment {}", userId, momentId);
            return false;
        } else {
            // Like the moment
            DevineMomentLike like = new DevineMomentLike();
            like.setMomentId(momentId);
            like.setUserId(userId);
            devineMomentLikeMapper.insertLike(like);
            devineMomentMapper.updateLikeCount(momentId, 1);
            log.info("User {} liked moment {}", userId, momentId);
            return true;
        }
    }
    
    @Override
    @Transactional
    public DevineMomentComment addComment(DevineMomentComment comment) {
        // Check if moment exists
        if (!devineMomentMapper.existsById(comment.getMomentId())) {
            throw new NotFoundException("Devine moment not found");
        }
        
        // Insert the comment
        int result = devineMomentCommentMapper.insertComment(comment);
        if (result <= 0) {
            throw new RuntimeException("Failed to add comment");
        }
        
        // Update comment count
        devineMomentMapper.updateCommentCount(comment.getMomentId(), 1);
        
        // Get the comment with user info
        List<DevineMomentComment> comments = devineMomentCommentMapper.findCommentsByMomentId(comment.getMomentId());
        DevineMomentComment createdComment = comments.stream()
                .filter(c -> c.getCommentId().equals(comment.getCommentId()))
                .findFirst()
                .orElse(comment);
        
        log.info("Successfully added comment with ID: {}", comment.getCommentId());
        return createdComment;
    }
    
    @Override
    public List<DevineMomentComment> getCommentsByMomentId(Long momentId) {
        // Check if moment exists
        if (!devineMomentMapper.existsById(momentId)) {
            throw new NotFoundException("Devine moment not found");
        }
        
        return devineMomentCommentMapper.findCommentsByMomentId(momentId);
    }
    
    @Override
    @Transactional
    public boolean deleteComment(Long commentId, Long userId) {
        log.info("Deleting comment: {} by user: {}", commentId, userId);
        
        // Check if comment exists and user owns it
        if (!devineMomentCommentMapper.existsById(commentId)) {
            throw new NotFoundException("Comment not found");
        }
        
        if (!devineMomentCommentMapper.isOwner(commentId, userId)) {
            throw new PermissionDeniedException("You can only delete your own comments");
        }
        
        // Get moment ID before deleting comment
        List<DevineMomentComment> comments = devineMomentCommentMapper.findCommentsByUserId(userId);
        Long momentId = comments.stream()
                .filter(c -> c.getCommentId().equals(commentId))
                .map(DevineMomentComment::getMomentId)
                .findFirst()
                .orElse(null);
        
        // Delete the comment
        int result = devineMomentCommentMapper.deleteComment(commentId);
        
        if (result > 0 && momentId != null) {
            // Update comment count
            devineMomentMapper.updateCommentCount(momentId, -1);
            log.info("Successfully deleted comment: {}", commentId);
            return true;
        }
        
        return false;
    }
    
    @Override
    public boolean canModifyMoment(Long momentId, Long userId) {
        return devineMomentMapper.isOwner(momentId, userId);
    }
}