package com.dvineservice.service;

import com.dvinedao.domain.Image;
import com.dvinedao.domain.Tour;

import java.util.List;

public interface ImageService {
    void updateImage(Tour tour);
    List<Image> findByTourId(Long tourId);
    void createImages(List<Image> images);
    void deleteImages(List<Image> imageIds);
}
