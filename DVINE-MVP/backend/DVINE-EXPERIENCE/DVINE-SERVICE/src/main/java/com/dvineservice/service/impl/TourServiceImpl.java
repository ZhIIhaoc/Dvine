package com.dvineservice.service.impl;

import com.dvinedao.domain.Image;
import com.dvinedao.domain.Tour;
import com.dvinedao.domain.TourQueryParam;
import com.dvinedao.mapper.TourMapper;
import com.dvineservice.exception.NotFoundException;
import com.dvineservice.service.ImageService;
import com.dvineservice.service.TourService;
import com.dvineservice.util.TourUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TourServiceImpl implements TourService {
    @Autowired
    private TourMapper tourMapper;
    @Autowired
    private ImageService imageService;

    /**
     * Helper method to ensure tour exists
     * @param tourId the tour ID to check
     * @return the tour if it exists
     * @throws NotFoundException if tour does not exist
     */
    private Tour ensureTourExists(Long tourId) {
        Tour tour = tourMapper.findById(tourId);
        if (tour == null) {
            throw new NotFoundException("Tour not found");
        }
        return tour;
    }



    @Transactional
    @Override
    public void createTour(Tour tour) {
        tourMapper.createTour(tour);
        List<Image> images = TourUtil.getImages(tour);
        imageService.createImages(images);
    }

    @Override
    public List<Tour> search(TourQueryParam tourQueryParam) {
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
}
