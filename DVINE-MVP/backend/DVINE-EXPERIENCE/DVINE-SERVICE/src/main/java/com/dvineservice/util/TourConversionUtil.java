package com.dvineservice.util;

import com.dvinedao.domain.PendingTour;
import com.dvinedao.domain.PendingTourImage;
import com.dvinedao.domain.Tour;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Utility class for converting between Tour and PendingTour entities
 * and handling related image operations.
 */
public class TourConversionUtil {

    /**
     * Converts a Tour entity to a PendingTour entity
     *
     * @param tour        the Tour to convert
     * @param submittedBy the ID of the user submitting the tour
     * @return the converted PendingTour
     */
    public static PendingTour convertTourToPendingTour(Tour tour, Long submittedBy) {
        PendingTour pendingTour = new PendingTour();
        pendingTour.setCatalogueId(tour.getCatalogueId());
        pendingTour.setTitle(tour.getTitle());
        pendingTour.setDestination(tour.getDestination());
        pendingTour.setDescription(tour.getDescription());
        pendingTour.setRegularPrice(tour.getRegularPrice());
        pendingTour.setPremiumPrice(tour.getPremiumPrice());
        pendingTour.setPrimaryImageUrl(tour.getPrimaryImageUrl());
        pendingTour.setSubmittedBy(submittedBy);
        return pendingTour;
    }

    /**
     * Converts a PendingTour entity to a Tour entity
     *
     * @param pendingTour the PendingTour to convert
     * @return the converted Tour
     */
    public static Tour convertPendingTourToTour(PendingTour pendingTour) {
        Tour tour = new Tour();
        tour.setCatalogueId(pendingTour.getCatalogueId());
        tour.setTitle(pendingTour.getTitle());
        tour.setDestination(pendingTour.getDestination());
        tour.setDescription(pendingTour.getDescription());
        tour.setRegularPrice(pendingTour.getRegularPrice());
        tour.setPremiumPrice(pendingTour.getPremiumPrice());
        tour.setPrimaryImageUrl(pendingTour.getPrimaryImageUrl());
        tour.setImages(pendingTour.getImages());
        tour.setCreatedBy(pendingTour.getSubmittedBy());
        return tour;
    }

    /**
     * Creates PendingTourImage entities from a list of image URLs
     *
     * @param pendingTourId the ID of the pending tour
     * @param imageUrls     the list of image URLs
     * @return list of PendingTourImage entities
     */
    public static List<PendingTourImage> createPendingTourImages(Long pendingTourId, List<String> imageUrls) {
        // Handle null imageUrls list
        if (imageUrls == null) {
            return List.of();
        }
        
        return imageUrls.stream()
                .map(url -> {
                    PendingTourImage image = new PendingTourImage();
                    image.setPendingTourId(pendingTourId);
                    image.setImageUrl(url);
                    image.setIsPrimary(imageUrls.indexOf(url) == 0); // First image is primary
                    return image;
                })
                .collect(Collectors.toList());
    }

    /**
     * Extracts image URLs from a list of PendingTourImage entities
     *
     * @param pendingTourImages the list of PendingTourImage entities
     * @return list of image URLs
     */
    public static List<String> extractImageUrls(List<PendingTourImage> pendingTourImages) {
        // Handle null pendingTourImages list
        if (pendingTourImages == null) {
            return List.of();
        }
        
        return pendingTourImages.stream()
                .map(PendingTourImage::getImageUrl)
                .collect(Collectors.toList());
    }
}