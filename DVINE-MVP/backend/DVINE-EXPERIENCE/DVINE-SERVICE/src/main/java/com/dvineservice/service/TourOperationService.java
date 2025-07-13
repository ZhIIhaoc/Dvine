package com.dvineservice.service;

import com.dvinedao.domain.PageResult;
import com.dvinedao.domain.Tour;
import com.dvinedao.domain.TourQueryParam;
import com.dvineservice.exception.NotFoundException;

import java.util.List;

/**
 * Core tour operations service
 * Contains basic CRUD operations without any approval workflow logic
 */
public interface TourOperationService {
    
    /**
     * Create a new tour directly
     */
    void createTour(Tour tour);
    
    /**
     * Search tours by query parameters
     */
    List<Tour> search(TourQueryParam tourQueryParam);
    
    /**
     * Search tours with pagination
     */
    PageResult<Tour> searchWithPagination(TourQueryParam tourQueryParam);
    
    /**
     * Find tour by ID
     */
    Tour findById(Long tourId);
    
    /**
     * Update an existing tour directly
     */
    void updateTour(Tour tour);
    
    /**
     * Delete a tour directly
     */
    void deleteTour(Long tourId);
    
    /**
     * Ensure a tour exists by ID
     * @param tourId the tour ID to check
     * @return the tour if it exists
     * @throws NotFoundException if tour does not exist
     */
    Tour ensureTourExists(Long tourId);
}