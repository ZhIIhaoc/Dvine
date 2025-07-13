package com.dvineservice.service;

import com.dvinedao.domain.Tour;
import com.dvinedao.domain.TourQueryParam;

import java.util.List;

public interface TourService {
    // Read operations (wrappers for consistent service layer routing)
    List<Tour> search(TourQueryParam tourQueryParam);
    Tour findById(Long tourId);
    
    // Permission checking
    boolean canPerformDirectOperation(Long userId);
    
    // Permission-aware methods (encapsulate business logic)
    void createTourWithPermissionCheck(Tour tour);
    void updateTourWithPermissionCheck(Tour tour);
    void deleteTourWithPermissionCheck(Long tourId);
}
