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
        imageService.createImages(images);
    }

    @Override
    public List<Tour> search(TourQueryParam tourQueryParam) {
        // If no catalogueId or catalogueName is provided, default to catalogue ID 1 (Default Catalogue)
        if (tourQueryParam.getCatalogueId() == null && 
            (tourQueryParam.getCatalogueName() == null || tourQueryParam.getCatalogueName().trim().isEmpty())) {
            tourQueryParam.setCatalogueId(1L);
        }
        
        List<Tour> tour = tourMapper.search(tourQueryParam);
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