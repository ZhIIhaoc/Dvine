package com.dvineservice.service;

import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

public interface TourImageService {
    List<String> uploadTourImages(Long tourId, MultipartFile[] files, boolean isPrimary, Long userId);
    List<Map<String, Object>> getTourImages(Long tourId);
    void deleteTourImage(Long tourId, Long imageId, Long userId);
    void updateTourImage(Long tourId, Long imageId, Boolean isPrimary, Long userId);
    String replacePrimaryImage(Long tourId, MultipartFile file, Long userId);
    boolean canModifyTourImages(Long tourId, Long userId);
}