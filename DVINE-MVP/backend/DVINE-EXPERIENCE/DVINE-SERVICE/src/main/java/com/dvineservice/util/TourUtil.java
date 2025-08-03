package com.dvineservice.util;

import com.dvinedao.domain.Image;
import com.dvinedao.domain.Tour;
import com.dvineservice.service.ImageService;

import java.util.ArrayList;
import java.util.List;

public class TourUtil {
    /**
     * Converts a Tour object into a list of Image objects.
     * Ensures that the primary image is included in the images list.
     *
     * @param tour The Tour object to convert.
     * @return A list of Image objects representing the tour's images.
     */
    public static List<Image> getImages(Tour tour) {
        // Ensure primary image is in the images list
        List<String> imageUrls = tour.getImages();
        
        // Handle null images list
        if (imageUrls == null) {
            imageUrls = new ArrayList<>();
        }
        
        if (tour.getPrimaryImageUrl() != null && !imageUrls.contains(tour.getPrimaryImageUrl())) {
            imageUrls = new ArrayList<>(imageUrls);
            imageUrls.add(tour.getPrimaryImageUrl());
        }

        // Create images list
        List<Image> images = imageUrls.stream().map(imgStr -> {
            Image image = new Image();
            image.setTourId(tour.getTourId());
            image.setImageUrl(imgStr);
            image.setIsPrimary(tour.getPrimaryImageUrl() != null && tour.getPrimaryImageUrl().equals(imgStr));
            return image;
        }).toList();
        return images;
    }

    /**
     * Populates the images list for a tour using the ImageService.
     * Follows the existing pattern used in TourOperationServiceImpl.
     *
     * @param tour The Tour object to populate with images.
     * @param imageService The ImageService to get images from.
     */
    public static void populateImages(Tour tour, ImageService imageService) {
        List<String> images = imageService.findByTourId(tour.getTourId()).stream()
                .map(Image::getImageUrl).toList();
        tour.setImages(images);
    }

    /**
     * Populates images for a list of tours using the ImageService.
     *
     * @param tours List of tours to populate with images.
     * @param imageService The ImageService to get images from.
     */
    public static void populateImages(List<Tour> tours, ImageService imageService) {
        for (Tour tour : tours) {
            populateImages(tour, imageService);
        }
    }
}
