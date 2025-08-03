package com.dvineservice.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dvinedao.domain.ApprovalStatus;
import com.dvinedao.domain.PendingTour;
import com.dvinedao.domain.PendingTourImage;
import com.dvinedao.domain.Tour;
import com.dvinedao.mapper.PendingTourImageMapper;
import com.dvinedao.mapper.PendingTourMapper;
import com.dvineservice.exception.NotFoundException;
import com.dvineservice.service.ImageService;
import com.dvineservice.service.PendingTourService;
import com.dvineservice.service.TourOperationService;
import com.dvineservice.util.TourConversionUtil;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class PendingTourServiceImpl implements PendingTourService {
    
    @Autowired
    private PendingTourMapper pendingTourMapper;
    
    @Autowired
    private PendingTourImageMapper pendingTourImageMapper;
    
    @Autowired
    private TourOperationService tourOperationService;
    
    @Autowired
    private ImageService imageService;

    @Override
    @Transactional
    public Long submitTourCreation(Tour tour, Long submittedBy) {
        log.info("submitTourCreation: {} by user {}", tour.getTourId(), submittedBy);
        PendingTour pendingTour = TourConversionUtil.convertTourToPendingTour(tour, submittedBy);
        pendingTour.setOperationType(PendingTour.OperationType.CREATE);
        
        createPendingTourWithImages(pendingTour, tour.getImages());
        return pendingTour.getPendingTourId();
    }

    @Override
    @Transactional
    public void submitTourUpdate(Tour tour, Long submittedBy) {
        log.info("submitTourUpdate: {} by user {}", tour.getTourId(), submittedBy);
        // Verify original tour exists
        tourOperationService.findById(tour.getTourId());
        
        PendingTour pendingTour = TourConversionUtil.convertTourToPendingTour(tour, submittedBy);
        pendingTour.setOperationType(PendingTour.OperationType.UPDATE);
        pendingTour.setOriginalTourId(tour.getTourId());
        
        createPendingTourWithImages(pendingTour, tour.getImages());
    }

    @Override
    @Transactional
    public void submitTourDeletion(Long tourId, Long submittedBy) {
        log.info("submitTourDeletion: {} by user {}", tourId, submittedBy);
        // Verify original tour exists
        Tour originalTour = tourOperationService.findById(tourId);
        
        PendingTour pendingTour = TourConversionUtil.convertTourToPendingTour(originalTour, submittedBy);
        pendingTour.setOperationType(PendingTour.OperationType.DELETE);
        pendingTour.setOriginalTourId(tourId);
        
        // Create pending tour record (for audit trail) - no images for delete
        createPendingTourWithImages(pendingTour, null);
    }

    @Override
    public List<PendingTour> getAllPendingTours() {
        log.info("getAllPendingTours - for management");
        List<PendingTour> pendingTours = pendingTourMapper.findAllPending();
        return loadImagesForPendingTours(pendingTours);
    }

    @Override
    public PendingTour getPendingTourById(Long pendingTourId) {
        log.info("getPendingTourById: {}", pendingTourId);
        PendingTour pendingTour = pendingTourMapper.findById(pendingTourId);
        if (pendingTour == null) {
            throw new NotFoundException("Pending tour not found");
        }
        loadPendingTourImages(pendingTour);
        return pendingTour;
    }

    @Override
    public List<PendingTour> getPendingToursBySubmitter(Long submittedBy) {
        log.info("getPendingToursBySubmitter: {}", submittedBy);
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
                log.info("Approving creation of pending tour: {}", pendingTourId);
                executeApprovedCreation(pendingTour);
                break;
            case UPDATE:
                log.info("Approving update of pending tour: {}", pendingTourId);
                executeApprovedUpdate(pendingTour);
                break;
            case DELETE:
                log.info("Approving deletion of pending tour: {}", pendingTourId);
                executeApprovedDeletion(pendingTour);
                break;
        }
        
        // Update pending tour status
        pendingTourMapper.updateApprovalStatus(pendingTourId, ApprovalStatus.APPROVED, reviewedBy);
    }

    @Override
    @Transactional
    public void rejectPendingTour(Long pendingTourId, Long reviewedBy) {
        log.info("Rejecting pending tour: {}", pendingTourId);
        validatePendingStatus(pendingTourId);
        
        // Update pending tour status to rejected
        pendingTourMapper.updateApprovalStatus(pendingTourId, ApprovalStatus.REJECTED, reviewedBy);
    }

    @Override
    public List<PendingTour> getApprovalHistory() {
        log.info("getApprovalHistory - approved and rejected tours");
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
        log.info("Creating pending tour");
        pendingTour.setStatus(ApprovalStatus.PENDING);
        
        // Create pending tour record
        pendingTourMapper.createPendingTour(pendingTour);
        
        // Create pending tour images if provided
        if (imageUrls != null && !imageUrls.isEmpty()) {
            List<PendingTourImage> images = TourConversionUtil.createPendingTourImages(pendingTour.getPendingTourId(), imageUrls);
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

    
    private void loadPendingTourImages(PendingTour pendingTour) {
        List<PendingTourImage> images = pendingTourImageMapper.findByPendingTourId(pendingTour.getPendingTourId());
        List<String> imageUrls = TourConversionUtil.extractImageUrls(images);
        pendingTour.setImages(imageUrls);
        
        // Set primary image URL
        String primaryImageUrl = images.stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                .map(PendingTourImage::getImageUrl)
                .findFirst()
                .orElse(null);
        pendingTour.setPrimaryImageUrl(primaryImageUrl);
    }
    
    private void executeApprovedCreation(PendingTour pendingTour) {
        log.info("Executing approved creation for pending tour: {}", pendingTour.getPendingTourId());
        log.info("Pending tour catalogueId: {}", pendingTour.getCatalogueId());
        
        Tour tour = TourConversionUtil.convertPendingTourToTour(pendingTour);
        log.info("Converted tour catalogueId: {}", tour.getCatalogueId());
        log.info("Converted tour title: {}", tour.getTitle());
        
        // The tourOperationService.createTour() method will handle image creation automatically
        // through TourUtil.getImages(tour) and imageService.createImages(images)
        tourOperationService.createTour(tour);
        log.info("Tour created with tourId: {}", tour.getTourId());
    }
    
    private void executeApprovedUpdate(PendingTour pendingTour) {
        Tour tour = TourConversionUtil.convertPendingTourToTour(pendingTour);
        tour.setTourId(pendingTour.getOriginalTourId());
        tourOperationService.updateTour(tour);
    }
    
    private void executeApprovedDeletion(PendingTour pendingTour) {
        tourOperationService.deleteTour(pendingTour.getOriginalTourId());
    }
    
}