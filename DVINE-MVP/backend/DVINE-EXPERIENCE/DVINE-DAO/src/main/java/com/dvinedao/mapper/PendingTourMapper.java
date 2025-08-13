package com.dvinedao.mapper;

import com.dvinedao.domain.PendingTour;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PendingTourMapper {
    
    /**
     * Create a new pending tour
     */
    void createPendingTour(PendingTour pendingTour);
    
    /**
     * Find pending tour by ID
     */
    PendingTour findById(Long pendingTourId);
    
    /**
     * Find all pending tours (for approval management)
     */
    List<PendingTour> findAllPending();
    
    /**
     * Find pending tours by status
     */
    List<PendingTour> findByStatus(@Param("status") Integer status);
    
    /**
     * Find pending tours submitted by a specific user
     */
    List<PendingTour> findBySubmittedBy(Long submittedBy);
    
    /**
     * Update pending tour status and reviewer info
     */
    void updateApprovalStatus(@Param("pendingTourId") Long pendingTourId, 
                              @Param("status") Integer status,
                              @Param("reviewedBy") Long reviewedBy);
    
    /**
     * Delete pending tour (after approval/rejection)
     */
    void deletePendingTour(Long pendingTourId);
    
    /**
     * Find pending tours for a specific original tour (for updates/deletes)
     */
    List<PendingTour> findByOriginalTourId(Long originalTourId);
}