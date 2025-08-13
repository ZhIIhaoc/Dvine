package com.dvinedao.mapper;

import com.dvinedao.domain.DevineMoment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Mapper interface for Devine Moment operations
 */
@Mapper
public interface DevineMomentMapper {
    int insertMoment(DevineMoment moment);

    List<DevineMoment> findAllMomentsWithUserInfo(@Param("currentUserId") Long currentUserId);

    DevineMoment findMomentByIdWithUserInfo(@Param("momentId") Long momentId, @Param("currentUserId") Long currentUserId);

    List<DevineMoment> findMomentsByUserId(@Param("userId") Long userId, @Param("currentUserId") Long currentUserId);

    int updateLikeCount(@Param("momentId") Long momentId, @Param("increment") int increment);
    
    /**
     * Update comment count for a moment
     * @param momentId the moment ID
     * @param increment true to increment, false to decrement
     * @return number of affected rows
     */
    int updateCommentCount(@Param("momentId") Long momentId, @Param("increment") int increment);
    
    /**
     * Delete a devine moment
     * @param momentId the moment ID
     * @return number of affected rows
     */
    int deleteMoment(@Param("momentId") Long momentId);
    
    /**
     * Check if a moment exists
     * @param momentId the moment ID
     * @return true if exists, false otherwise
     */
    boolean existsById(@Param("momentId") Long momentId);
    
    /**
     * Check if a user owns a moment
     * @param momentId the moment ID
     * @param userId the user ID
     * @return true if user owns the moment, false otherwise
     */
    boolean isOwner(@Param("momentId") Long momentId, @Param("userId") Long userId);
}