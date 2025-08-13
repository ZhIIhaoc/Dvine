package com.dvinedao.mapper;

import com.dvinedao.domain.PendingTourImage;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface PendingTourImageMapper {
    
    /**
     * Create images for a pending tour
     */
    void createImages(List<PendingTourImage> images);
    
    /**
     * Find images by pending tour ID
     */
    List<PendingTourImage> findByPendingTourId(Long pendingTourId);
    
    /**
     * Delete images for a pending tour
     */
    void deleteByPendingTourId(Long pendingTourId);
}