package com.dvineservice.service.impl;

import com.dvinedao.annotation.AdminPermissionCheck;
import com.dvinedao.annotation.CatalogueOwnerCheck;
import com.dvinedao.domain.Image;
import com.dvinedao.domain.Tour;
import com.dvinedao.domain.TourQueryParam;
import com.dvinedao.mapper.ImageMapper;
import com.dvinedao.mapper.TourMapper;
import com.dvineservice.exception.NotFoundException;
import com.dvineservice.service.TourService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class TourServiceImpl implements TourService {
    @Autowired
    private TourMapper tourMapper;
    @Autowired
    private ImageMapper imageMapper;

    @AdminPermissionCheck
    @CatalogueOwnerCheck
    @Transactional
    @Override
    public void createTour(Tour tour) {
        // Save the tour to the database
        tourMapper.createTour(tour);

        // Ensure primary image is in the images list
        List<String> imageUrls = tour.getImages();
        if (tour.getPrimaryImageUrl() != null && !imageUrls.contains(tour.getPrimaryImageUrl())) {
            imageUrls = new ArrayList<>(imageUrls);
            imageUrls.add(tour.getPrimaryImageUrl());
        }

        // Create images list
        List<Image> images = imageUrls.stream().map(imgStr -> {
            Image image = new Image();
            image.setTourId(tour.getTourId());
            image.setImageUrl(imgStr);
            image.setIsPrimary(tour.getPrimaryImageUrl().equals(imgStr));
            return image;
        }).toList();

        // Save the images using the ImageMapper
        imageMapper.createImages(images);
    }

    @Override
    public List<Tour> search(TourQueryParam tourQueryParam) {
        List<Tour> tour = tourMapper.search(tourQueryParam);
        if (tour == null) {
            throw new NotFoundException("No such tours");
        }
        return tour;
    }

    @Override
    public Tour findById(Long tourId) {
        Tour tour = tourMapper.findById(tourId);
        if (tour == null) {
            throw new NotFoundException("Tour not found");
        }
        List<String> images = imageMapper.findByTourId(tourId).stream()
                .map(image -> image.getImageUrl()).toList();
        tour.setImages(images);
        return tour;
    }
}
