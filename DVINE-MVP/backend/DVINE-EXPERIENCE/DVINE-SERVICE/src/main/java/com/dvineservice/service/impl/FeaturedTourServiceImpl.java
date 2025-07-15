package com.dvineservice.service.impl;

import com.dvinedao.domain.FeaturedTour;
import com.dvinedao.domain.Tour;
import com.dvinedao.mapper.FeaturedTourMapper;
import com.dvinedao.mapper.TourMapper;
import com.dvineservice.exception.NotFoundException;
import com.dvineservice.service.FeaturedTourService;
import com.dvineservice.service.ImageService;
import com.dvineservice.util.TourUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
public class FeaturedTourServiceImpl implements FeaturedTourService {

    @Autowired
    private FeaturedTourMapper featuredTourMapper;

    @Autowired
    private TourMapper tourMapper;

    @Autowired
    private ImageService imageService;

    @Override
    public List<Tour> getFeaturedToursForMainPage() {
        log.info("getToursForMainPage");
        List<Tour> tours = featuredTourMapper.getFeaturedToursForMainPage();
        
        // Populate images for all tours using TourUtil (avoiding redundant code)
        TourUtil.populateImages(tours, imageService);
        
        return tours;
    }

    @Override
    public List<FeaturedTour> getAllFeaturedTours() {
        log.info("getAllFeaturedTours - for management");
        return featuredTourMapper.getAllFeaturedTours();
    }

    @Override
    @Transactional
    public void addFeaturedTour(Long tourId) {
        log.info("addFeaturedTour:{} - for management", tourId);
        // Verify tour exists
        Tour tour = tourMapper.findById(tourId);
        if (tour == null) {
            throw new NotFoundException("Tour not found");
        }

        // Check if tour is already featured
        if (featuredTourMapper.isTourFeatured(tourId)) {
            throw new IllegalStateException("Tour is already featured");
        }

        // Get next display order (max + 1)
        Integer maxOrder = featuredTourMapper.getMaxDisplayOrder();
        int nextOrder = (maxOrder == null) ? 1 : maxOrder + 1;

        // Add to featured list
        FeaturedTour featuredTour = new FeaturedTour();
        featuredTour.setTourId(tourId);
        featuredTour.setDisplayOrder(nextOrder);
        featuredTourMapper.addFeaturedTour(featuredTour);
    }

    @Override
    @Transactional
    public void removeFeaturedTour(Long tourId) {
        // Check if tour is featured
        if (!featuredTourMapper.isTourFeatured(tourId)) {
            throw new IllegalStateException("Tour is not featured");
        }

        // Remove from featured list
        featuredTourMapper.removeFeaturedTour(tourId);

        // Reorder remaining tours to fill gaps
        reorderAfterRemoval();
    }

    @Override
    @Transactional
    public void reorderFeaturedTours(List<FeaturedTour> reorderedTours) {
        // Validate that all tours in the list are currently featured
        for (FeaturedTour featuredTour : reorderedTours) {
            if (!featuredTourMapper.isTourFeatured(featuredTour.getTourId())) {
                throw new IllegalStateException("Tour " + featuredTour.getTourId() + " is not featured");
            }
        }

        // Validate display orders are consecutive starting from 1
        reorderedTours.sort((a, b) -> a.getDisplayOrder().compareTo(b.getDisplayOrder()));
        for (int i = 0; i < reorderedTours.size(); i++) {
            if (!reorderedTours.get(i).getDisplayOrder().equals(i + 1)) {
                throw new IllegalArgumentException("Display orders must be consecutive starting from 1");
            }
        }

        // Update the order
        featuredTourMapper.reorderFeaturedTours(reorderedTours);
    }

    /**
     * Helper method to reorder tours after removal to eliminate gaps
     */
    private void reorderAfterRemoval() {
        List<FeaturedTour> remainingTours = featuredTourMapper.getAllFeaturedTours();
        
        // Reassign consecutive display orders starting from 1
        for (int i = 0; i < remainingTours.size(); i++) {
            FeaturedTour tour = remainingTours.get(i);
            tour.setDisplayOrder(i + 1);
        }
        
        if (!remainingTours.isEmpty()) {
            featuredTourMapper.reorderFeaturedTours(remainingTours);
        }
    }
}