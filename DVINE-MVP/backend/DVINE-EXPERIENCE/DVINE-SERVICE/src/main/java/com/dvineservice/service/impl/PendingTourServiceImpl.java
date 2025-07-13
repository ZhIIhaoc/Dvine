package com.dvineservice.service.impl;

import com.dvinedao.domain.*;
import com.dvinedao.domain.ApprovalStatus;
import com.dvinedao.mapper.PendingTourImageMapper;
import com.dvinedao.mapper.PendingTourMapper;
import com.dvineservice.exception.NotFoundException;
import com.dvineservice.service.ImageService;
import com.dvineservice.service.PendingTourService;
import com.dvineservice.service.TourService;
import com.dvineservice.util.TourUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PendingTourServiceImpl implements PendingTourService {
    
    @Autowired
    private PendingTourMapper pendingTourMapper;
    
    @Autowired
    private PendingTourImageMapper pendingTourImageMapper;
    
    @Autowired
    private TourService tourService;
    
    @Autowired
    private ImageService imageService;

    @Override
    @Transactional
    public void submitTourCreation(Tour tour, Long submittedBy) {
        PendingTour pendingTour = createPendingTourFromTour(tour, submittedBy);
        pendingTour.setOperationType(PendingTour.OperationType.CREATE);
        
        createPendingTourWithImages(pendingTour, tour.getImages());
    }

    @Override
    @Transactional
    public void submitTourUpdate(Tour tour, Long submittedBy) {
        // Verify original tour exists
        tourService.findById(tour.getTourId());
        
        PendingTour pendingTour = createPendingTourFromTour(tour, submittedBy);
        pendingTour.setOperationType(PendingTour.OperationType.UPDATE);
        pendingTour.setOriginalTourId(tour.getTourId());
        
        createPendingTourWithImages(pendingTour, tour.getImages());
    }

    @Override
    @Transactional
    public void submitTourDeletion(Long tourId, Long submittedBy) {
        // Verify original tour exists
        Tour originalTour = tourService.findById(tourId);
        
        PendingTour pendingTour = createPendingTourFromTour(originalTour, submittedBy);
        pendingTour.setOperationType(PendingTour.OperationType.DELETE);
        pendingTour.setOriginalTourId(tourId);
        
        // Create pending tour record (for audit trail) - no images for delete
        createPendingTourWithImages(pendingTour, null);
    }

    @Override
    public List<PendingTour> getAllPendingTours() {
        List<PendingTour> pendingTours = pendingTourMapper.findAllPending();
        return loadImagesForPendingTours(pendingTours);
    }

    @Override
    public PendingTour getPendingTourById(Long pendingTourId) {
        PendingTour pendingTour = pendingTourMapper.findById(pendingTourId);
        if (pendingTour == null) {
            throw new NotFoundException("Pending tour not found");
        }
        loadPendingTourImages(pendingTour);
        return pendingTour;
    }

    @Override
    public List<PendingTour> getPendingToursBySubmitter(Long submittedBy) {
        List<PendingTour> pendingTours = pendingTourMapper.findBySubmittedBy(submittedBy);
        return loadImagesForPendingTours(pendingTours);
    }

    @Override
    @Transactional
    public void approvePendingTour(Long pendingTourId, Long reviewedBy) {
        PendingTour pendingTour = validatePendingStatus(pendingTourId);
        
        // Execute the actual operation based on type
        switch (pendingTour.getOperationType()) {
            case CREATE:
                executeApprovedCreation(pendingTour);
                break;
            case UPDATE:
                executeApprovedUpdate(pendingTour);
                break;
            case DELETE:
                executeApprovedDeletion(pendingTour);
                break;
        }
        
        // Update pending tour status
        pendingTourMapper.updateApprovalStatus(pendingTourId, ApprovalStatus.APPROVED, reviewedBy);
    }

    @Override
    @Transactional
    public void rejectPendingTour(Long pendingTourId, Long reviewedBy) {
        validatePendingStatus(pendingTourId);
        
        // Update pending tour status to rejected
        pendingTourMapper.updateApprovalStatus(pendingTourId, ApprovalStatus.REJECTED, reviewedBy);
    }

    @Override
    public List<PendingTour> getApprovalHistory() {
        List<PendingTour> approved = pendingTourMapper.findByStatus(ApprovalStatus.APPROVED);
        List<PendingTour> rejected = pendingTourMapper.findByStatus(ApprovalStatus.REJECTED);
        
        approved.addAll(rejected);
        
        return loadImagesForPendingTours(approved).stream()
                .sorted((a, b) -> {
                    if (a.getReviewTime() == null && b.getReviewTime() == null) return 0;
                    if (a.getReviewTime() == null) return 1;
                    if (b.getReviewTime() == null) return -1;
                    return b.getReviewTime().compareTo(a.getReviewTime());
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Creates a pending tour with images
     */
    private void createPendingTourWithImages(PendingTour pendingTour, List<String> imageUrls) {
        pendingTour.setStatus(ApprovalStatus.PENDING);
        
        // Create pending tour record
        pendingTourMapper.createPendingTour(pendingTour);
        
        // Create pending tour images if provided
        if (imageUrls != null && !imageUrls.isEmpty()) {
            List<PendingTourImage> images = createPendingTourImages(pendingTour.getPendingTourId(), imageUrls);
            pendingTourImageMapper.createImages(images);
        }
    }
    
    /**
     * Validates that a pending tour exists and is in pending status
     */
    private PendingTour validatePendingStatus(Long pendingTourId) {
        PendingTour pendingTour = getPendingTourById(pendingTourId);
        
        if (!ApprovalStatus.isPending(pendingTour.getStatus())) {
            throw new IllegalStateException("Tour is not pending approval");
        }
        
        return pendingTour;
    }
    
    /**
     * Loads images for a collection of pending tours
     */
    private List<PendingTour> loadImagesForPendingTours(List<PendingTour> pendingTours) {
        pendingTours.forEach(this::loadPendingTourImages);
        return pendingTours;
    }

    private PendingTour createPendingTourFromTour(Tour tour, Long submittedBy) {
        PendingTour pendingTour = new PendingTour();
        pendingTour.setCatalogueId(tour.getCatalogueId());
        pendingTour.setTitle(tour.getTitle());
        pendingTour.setDestination(tour.getDestination());
        pendingTour.setDescription(tour.getDescription());
        pendingTour.setPrice(tour.getPrice());
        pendingTour.setPrimaryImageUrl(tour.getPrimaryImageUrl());
        pendingTour.setSubmittedBy(submittedBy);
        return pendingTour;
    }
    
    private List<PendingTourImage> createPendingTourImages(Long pendingTourId, List<String> imageUrls) {
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
    
    private void loadPendingTourImages(PendingTour pendingTour) {
        List<PendingTourImage> images = pendingTourImageMapper.findByPendingTourId(pendingTour.getPendingTourId());
        List<String> imageUrls = images.stream()
                .map(PendingTourImage::getImageUrl)
                .collect(Collectors.toList());
        pendingTour.setImages(imageUrls);
    }
    
    private void executeApprovedCreation(PendingTour pendingTour) {
        Tour tour = convertPendingTourToTour(pendingTour);
        tourService.createTour(tour);
    }
    
    private void executeApprovedUpdate(PendingTour pendingTour) {
        Tour tour = convertPendingTourToTour(pendingTour);
        tour.setTourId(pendingTour.getOriginalTourId());
        tourService.updateTour(tour);
    }
    
    private void executeApprovedDeletion(PendingTour pendingTour) {
        tourService.deleteTour(pendingTour.getOriginalTourId());
    }
    
    private Tour convertPendingTourToTour(PendingTour pendingTour) {
        Tour tour = new Tour();
        tour.setCatalogueId(pendingTour.getCatalogueId());
        tour.setTitle(pendingTour.getTitle());
        tour.setDestination(pendingTour.getDestination());
        tour.setDescription(pendingTour.getDescription());
        tour.setPrice(pendingTour.getPrice());
        tour.setPrimaryImageUrl(pendingTour.getPrimaryImageUrl());
        tour.setImages(pendingTour.getImages());
        return tour;
    }
}