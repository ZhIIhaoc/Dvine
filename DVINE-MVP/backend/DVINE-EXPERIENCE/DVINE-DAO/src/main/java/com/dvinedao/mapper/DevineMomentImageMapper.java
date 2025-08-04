package com.dvinedao.mapper;

import com.dvinedao.domain.DevineMomentImage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Mapper interface for Devine Moment Image operations
 */
@Mapper
public interface DevineMomentImageMapper {
    
    /**
     * Insert a new moment image
     * @param image the image to insert
     * @return number of affected rows
     */
    int insertImage(DevineMomentImage image);
    
    /**
     * Get all images for a specific moment
     * @param momentId the moment ID
     * @return list of images
     */
    List<DevineMomentImage> findImagesByMomentId(@Param("momentId") Long momentId);
    
    /**
     * Get image URLs for a specific moment
     * @param momentId the moment ID
     * @return list of image URLs
     */
    List<String> findImageUrlsByMomentId(@Param("momentId") Long momentId);
    
    /**
     * Delete all images for a moment
     * @param momentId the moment ID
     * @return number of affected rows
     */
    int deleteImagesByMomentId(@Param("momentId") Long momentId);
    
    /**
     * Delete a specific image
     * @param imageId the image ID
     * @return number of affected rows
     */
    int deleteImage(@Param("imageId") Long imageId);
    
    /**
     * Update primary image status
     * @param momentId the moment ID
     * @param imageId the image ID to set as primary
     * @return number of affected rows
     */
    int updatePrimaryImage(@Param("momentId") Long momentId, @Param("imageId") Long imageId);
}