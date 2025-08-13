package com.dvinedao.mapper;

import com.dvinedao.domain.DevineMomentLike;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Mapper interface for Devine Moment Like operations
 */
@Mapper
public interface DevineMomentLikeMapper {
    
    /**
     * Insert a new like
     * @param like the like to insert
     * @return number of affected rows
     */
    int insertLike(DevineMomentLike like);
    
    /**
     * Delete a like
     * @param momentId the moment ID
     * @param userId the user ID
     * @return number of affected rows
     */
    int deleteLike(@Param("momentId") Long momentId, @Param("userId") Long userId);
    
    /**
     * Check if a user has liked a moment
     * @param momentId the moment ID
     * @param userId the user ID
     * @return true if user has liked the moment, false otherwise
     */
    boolean hasUserLikedMoment(@Param("momentId") Long momentId, @Param("userId") Long userId);
    
    /**
     * Get all likes for a specific moment
     * @param momentId the moment ID
     * @return list of likes
     */
    List<DevineMomentLike> findLikesByMomentId(@Param("momentId") Long momentId);
    
    /**
     * Get likes by user ID
     * @param userId the user ID
     * @return list of likes by the user
     */
    List<DevineMomentLike> findLikesByUserId(@Param("userId") Long userId);
    
    /**
     * Delete all likes for a moment
     * @param momentId the moment ID
     * @return number of affected rows
     */
    int deleteLikesByMomentId(@Param("momentId") Long momentId);
    
    /**
     * Get like count for a moment
     * @param momentId the moment ID
     * @return like count
     */
    int getLikeCount(@Param("momentId") Long momentId);
    
    /**
     * Get users who liked a moment with their information
     * @param momentId the moment ID
     * @return list of user information who liked the moment
     */
    List<Object> findUsersWhoLikedMoment(@Param("momentId") Long momentId);
}