package com.dvineservice.service.impl;

import com.dvinedao.domain.Image;
import com.dvinedao.domain.PageResult;
import com.dvinedao.domain.Tour;
import com.dvinedao.domain.TourQueryParam;
import com.dvinedao.mapper.TourMapper;
import com.dvineservice.exception.NotFoundException;
import com.dvineservice.service.ImageService;
import com.dvineservice.service.TourOperationService;
import com.dvineservice.util.TourUtil;
import com.dvineservice.util.UserUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Core tour operations implementation
 * Contains basic CRUD operations without any approval workflow logic
 */
@Service
public class TourOperationServiceImpl implements TourOperationService {
    
    @Autowired
    private TourMapper tourMapper;
    
    @Autowired
    private ImageService imageService;

    @Override
    public Tour ensureTourExists(Long tourId) {
        Tour tour = tourMapper.findById(tourId);
        if (tour == null) {
            throw new NotFoundException("Tour not found");
        }
        return tour;
    }

    @Transactional
    @Override
    public void createTour(Tour tour) {
        // Set the creator of the tour to the current user
        if (tour.getCreatedBy() == null) {
            tour.setCreatedBy(UserUtil.getCurrentUserId());
        }
        
        tourMapper.createTour(tour);
        List<Image> images = TourUtil.getImages(tour);
        
        // Only create images if there are actual images to create
        if (images != null && !images.isEmpty()) {
            imageService.createImages(images);
        }
    }

    @Override
    public List<Tour> search(TourQueryParam tourQueryParam) {
        // If no catalogueId or catalogueName is provided, default to catalogue ID 1 (Default Catalogue)
//        if (tourQueryParam.getCatalogueId() == null &&
//            (tourQueryParam.getCatalogueName() == null || tourQueryParam.getCatalogueName().trim().isEmpty())) {
//            tourQueryParam.setCatalogueId(1L);
//        }

//        tourQueryParam.setPage(1000);
        
        List<Tour> tour = tourMapper.search(tourQueryParam);
        
        // If searching by createdBy (user's own tours), return empty list instead of throwing exception
        // This allows users to see their tours page even if they haven't created any tours yet
        if (tour.isEmpty() && tourQueryParam.getCreatedBy() != null) {
            return tour; // Return empty list for user's own tours
        }
        
        // For general searches (no specific criteria) or when no tours exist in the system,
        // return empty list instead of throwing exception
        // This allows admin pages to load even when there are no tours in the system
        if (tour.isEmpty() && 
            tourQueryParam.getTourId() == null && 
            tourQueryParam.getCatalogueId() == null && 
            tourQueryParam.getCatalogueName() == null && 
            tourQueryParam.getTitle() == null && 
            tourQueryParam.getDestination() == null && 
            tourQueryParam.getMinPrice() == null && 
            tourQueryParam.getMaxPrice() == null) {
            return tour; // Return empty list for general searches
        }
        
        // For other search criteria with specific filters, throw exception if no tours found
        if (tour.isEmpty()) {
            throw new NotFoundException("Tour not found");
        }
        return tour;
    }

    @Override
    public Tour findById(Long tourId) {
        Tour tour = ensureTourExists(tourId);
        List<String> images = imageService.findByTourId(tourId).stream()
                .map(Image::getImageUrl).toList();
        tour.setImages(images);
        return tour;
    }

    @Transactional
    @Override
    public void updateTour(Tour tour) {
        // Check if tour exists first
        ensureTourExists(tour.getTourId());
        tourMapper.updateTour(tour);
        imageService.updateImage(tour);
    }

    @Transactional
    @Override
    public void deleteTour(Long tourId) {
        // Check if tour exists first
        ensureTourExists(tourId);

        // Delete child records FIRST (images) to avoid FK constraint violation
        List<Image> images = imageService.findByTourId(tourId);
        if (!images.isEmpty()) {
            imageService.deleteImages(images);
        }

        // Then delete the parent record (tour)
        tourMapper.deleteTour(tourId);
    }

    @Override
    public PageResult<Tour> searchWithPagination(TourQueryParam tourQueryParam) {
        // If no catalogueId or catalogueName is provided, default to catalogue ID 1 (Default Catalogue)
        if (tourQueryParam.getCatalogueId() == null && 
            (tourQueryParam.getCatalogueName() == null || tourQueryParam.getCatalogueName().trim().isEmpty())) {
            tourQueryParam.setCatalogueId(1L);
        }
        
        // Validate pagination parameters
        long totalElements = tourMapper.countSearch(tourQueryParam);

        // If no results, return empty PageResult
        if (totalElements == 0) {
            return new PageResult<>(new ArrayList<>(), tourQueryParam.getPage(), tourQueryParam.getSize(), 0);
        }

        // Ensure page and size are within valid bounds
        List<Tour> tours = tourMapper.search(tourQueryParam);

        return new PageResult<>(tours, tourQueryParam.getPage(), tourQueryParam.getSize(), totalElements);
    }
}