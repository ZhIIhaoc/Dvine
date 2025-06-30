package com.dvineservice.util;

import com.dvinedao.domain.Image;
import com.dvinedao.domain.Tour;

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
        return images;
    }
}
