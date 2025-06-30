package com.dvineservice.service.impl;

import com.dvinedao.domain.Image;
import com.dvinedao.domain.Tour;
import com.dvinedao.mapper.ImageMapper;
import com.dvineservice.service.ImageService;
import com.dvineservice.util.TourUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class ImageServiceImpl implements ImageService {
    @Autowired
    private ImageMapper imageMapper;

    @Override
    public void updateImage(Tour tour) {
        // Get the existing images for the tour
        List<Image> existingImages = imageMapper.findByTourId(tour.getTourId());
        // Get the new images from the tour object
        List<Image> newImages = TourUtil.getImages(tour);

        // Get IDs of existing images that should be deleted
        List<Long> imageIdsToDelete = existingImages.stream()
                .filter(existingImage -> !newImages.contains(existingImage))
                .map(Image::getImageId)
                .filter(Objects::nonNull)
                .toList();

        // Batch delete images
        if (!imageIdsToDelete.isEmpty()) {
            imageMapper.deleteImages(imageIdsToDelete);
        }

        // Create only new images (since newImages won't have imageId set)
        List<Image> imagesToCreate = newImages.stream()
                .filter(newImage -> !existingImages.contains(newImage))
                .toList();

        if (!imagesToCreate.isEmpty()) {
            imageMapper.createImages(imagesToCreate);
        }
    }

    @Override
    public List<Image> findByTourId(Long tourId) {
        List<Image> images = imageMapper.findByTourId(tourId);
        if (images == null || images.isEmpty()) {
            return List.of();
        }
        return images;
    }

    @Override
    public void createImages(List<Image> images) {
        if (images == null || images.isEmpty()) {
            return; // No images to create
        }
        imageMapper.createImages(images);
    }

    @Override
    public void deleteImages(List<Image> image) {
        List<Long> imageIds = image.stream()
                .map(Image::getImageId)
                .filter(Objects::nonNull)
                .toList();
        if (!imageIds.isEmpty()) {
            imageMapper.deleteImages(imageIds);
        }
    }


}
