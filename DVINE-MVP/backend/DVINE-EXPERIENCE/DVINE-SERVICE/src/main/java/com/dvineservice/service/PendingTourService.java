package com.dvineservice.service;

import java.util.List;

import com.dvinedao.domain.PendingTour;
import com.dvinedao.domain.Tour;

public interface PendingTourService {
    
    /**
     * Submit a tour creation request for approval
     * @return the ID of the created pending tour
     */
    Long submitTourCreation(Tour tour, Long submittedBy);
    
    /**
     * Submit a tour update request for approval
     */
    void submitTourUpdate(Tour tour, Long submittedBy);
    
    /**
     * Submit a tour deletion request for approval
     */
    void submitTourDeletion(Long tourId, Long submittedBy);
    
    /**
     * Get all pending tours awaiting approval
     */
    List<PendingTour> getAllPendingTours();
    
    /**
     * Get pending tour by ID
     */
    PendingTour getPendingTourById(Long pendingTourId);
    
    /**
     * Get pending tours submitted by a specific user
     */
    List<PendingTour> getPendingToursBySubmitter(Long submittedBy);
    
    /**
     * Approve a pending tour
     */
    void approvePendingTour(Long pendingTourId, Long reviewedBy);
    
    /**
     * Reject a pending tour
     */
    void rejectPendingTour(Long pendingTourId, Long reviewedBy);
    
    /**
     * Get approval history (approved and rejected tours)
     */
    List<PendingTour> getApprovalHistory();
}