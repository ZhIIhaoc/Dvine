package com.dvinedao.mapper;

import com.dvinedao.domain.DevineMomentComment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Mapper interface for Devine Moment Comment operations
 */
@Mapper
public interface DevineMomentCommentMapper {
    
    /**
     * Insert a new comment
     * @param comment the comment to insert
     * @return number of affected rows
     */
    int insertComment(DevineMomentComment comment);
    
    /**
     * Get all comments for a specific moment with user information
     * @param momentId the moment ID
     * @return list of comments with user info
     */
    List<DevineMomentComment> findCommentsByMomentId(@Param("momentId") Long momentId);
    
    /**
     * Get comments by user ID
     * @param userId the user ID
     * @return list of comments by the user
     */
    List<DevineMomentComment> findCommentsByUserId(@Param("userId") Long userId);
    
    /**
     * Update a comment
     * @param comment the comment to update
     * @return number of affected rows
     */
    int updateComment(DevineMomentComment comment);
    
    /**
     * Delete a comment
     * @param commentId the comment ID
     * @return number of affected rows
     */
    int deleteComment(@Param("commentId") Long commentId);
    
    /**
     * Delete all comments for a moment
     * @param momentId the moment ID
     * @return number of affected rows
     */
    int deleteCommentsByMomentId(@Param("momentId") Long momentId);
    
    /**
     * Check if a comment exists
     * @param commentId the comment ID
     * @return true if exists, false otherwise
     */
    boolean existsById(@Param("commentId") Long commentId);
    
    /**
     * Check if a user owns a comment
     * @param commentId the comment ID
     * @param userId the user ID
     * @return true if user owns the comment, false otherwise
     */
    boolean isOwner(@Param("commentId") Long commentId, @Param("userId") Long userId);
    
    /**
     * Get comment count for a moment
     * @param momentId the moment ID
     * @return comment count
     */
    int getCommentCount(@Param("momentId") Long momentId);
}