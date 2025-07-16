package com.dvinedao.mapper;

import com.dvinedao.domain.FeaturedTour;
import com.dvinedao.domain.Tour;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FeaturedTourMapper {
    
    /**
     * Get all featured tours ordered by display order for main page
     */
    List<Tour> getFeaturedToursForMainPage();
    
    /**
     * Get all featured tour entries (for management)
     */
    List<FeaturedTour> getAllFeaturedTours();
    
    /**
     * Add a tour to featured list
     */
    void addFeaturedTour(FeaturedTour featuredTour);
    
    /**
     * Remove a tour from featured list
     */
    void removeFeaturedTour(@Param("tourId") Long tourId);
    
    /**
     * Update display order of a featured tour
     */
    void updateDisplayOrder(@Param("tourId") Long tourId, @Param("newOrder") Integer newOrder);
    
    /**
     * Get the maximum display order (for adding new featured tours)
     */
    Integer getMaxDisplayOrder();
    
    /**
     * Check if a tour is already featured
     */
    boolean isTourFeatured(@Param("tourId") Long tourId);
    
    /**
     * Reorder featured tours (batch update for rearranging)
     */
    void reorderFeaturedTours(@Param("featuredTours") List<FeaturedTour> featuredTours);
}