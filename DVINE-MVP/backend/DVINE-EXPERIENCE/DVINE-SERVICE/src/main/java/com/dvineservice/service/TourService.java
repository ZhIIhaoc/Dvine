package com.dvineservice.service;

import java.util.List;

import com.dvinedao.domain.PageResult;
import com.dvinedao.domain.Tour;
import com.dvinedao.domain.TourQueryParam;

public interface TourService {
    
    List<Tour> search(TourQueryParam tourQueryParam);
    PageResult<Tour> searchWithPagination(TourQueryParam tourQueryParam);
    Tour findById(Long tourId);
    boolean canPerformDirectOperation(Long userId);
    Long createTourWithPermissionCheck(Tour tour);
    boolean updateTourWithPermissionCheck(Tour tour);
    boolean deleteTourWithPermissionCheck(Long tourId);
}
