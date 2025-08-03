package com.dvineservice.service;

import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

public interface PendingTourImageService {
    List<String> uploadPendingTourImages(Long pendingTourId, MultipartFile[] files, boolean isPrimary, Long userId);
    List<Map<String, Object>> getPendingTourImages(Long pendingTourId);
    void deletePendingTourImage(Long pendingTourId, Long imageId, Long userId);
    void updatePendingTourImage(Long pendingTourId, Long imageId, Boolean isPrimary, Long userId);
    String replacePrimaryImage(Long pendingTourId, MultipartFile file, Long userId);
    boolean canModifyPendingTourImages(Long pendingTourId, Long userId);
}