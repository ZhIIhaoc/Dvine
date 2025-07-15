package com.dvineservice.service;

import com.dvinedao.domain.FeaturedTour;
import com.dvinedao.domain.Tour;

import java.util.List;

public interface FeaturedTourService {
    
    /**
     * Get featured tours for main page display (public access)
     */
    List<Tour> getFeaturedToursForMainPage();
    
    /**
     * Get all featured tours for management (Manager permission required)
     */
    List<FeaturedTour> getAllFeaturedTours();
    
    /**
     * Add a tour to featured list (Manager permission required)
     */
    void addFeaturedTour(Long tourId);
    
    /**
     * Remove a tour from featured list (Manager permission required)
     */
    void removeFeaturedTour(Long tourId);
    
    /**
     * Reorder featured tours (Manager permission required)
     * @param reorderedTours List of FeaturedTour objects with new display orders
     */
    void reorderFeaturedTours(List<FeaturedTour> reorderedTours);
}