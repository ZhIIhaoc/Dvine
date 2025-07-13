package com.dvineservice.service;

import com.dvinedao.domain.Tour;
import com.dvinedao.domain.TourQueryParam;

import java.util.List;

public interface TourService {
    void createTour(Tour tour);
    List<Tour> search(TourQueryParam tourQueryParam);
    Tour findById(Long tourId);
    void updateTour(Tour tour);
    void deleteTour(Long tourId);
    
    // Permission checking
    boolean canPerformDirectOperation(Long userId);
    
    // Permission-aware methods (encapsulate business logic)
    void createTourWithPermissionCheck(Tour tour);
    void updateTourWithPermissionCheck(Tour tour);
    void deleteTourWithPermissionCheck(Long tourId);
    
    // Explicit approval submission methods
    void submitTourForApproval(Tour tour, Long userId);
    void submitTourUpdateForApproval(Tour tour, Long userId);
    void submitTourDeletionForApproval(Long tourId, Long userId);
}
