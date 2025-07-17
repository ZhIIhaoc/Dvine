package com.dvineservice.service;

import com.dvinedao.domain.PageResult;
import com.dvinedao.domain.Tour;
import com.dvinedao.domain.TourQueryParam;

import java.util.List;

public interface TourService {
    // Read operations (wrappers for consistent service layer routing)
    List<Tour> search(TourQueryParam tourQueryParam);
    PageResult<Tour> searchWithPagination(TourQueryParam tourQueryParam);
    Tour findById(Long tourId);
    
    // Permission checking
    boolean canPerformDirectOperation(Long userId);
    
    // Permission-aware methods (encapsulate business logic)
    // Returns true if operation was performed directly, false if submitted for approval
    boolean createTourWithPermissionCheck(Tour tour);
    boolean updateTourWithPermissionCheck(Tour tour);
    boolean deleteTourWithPermissionCheck(Long tourId);
}
