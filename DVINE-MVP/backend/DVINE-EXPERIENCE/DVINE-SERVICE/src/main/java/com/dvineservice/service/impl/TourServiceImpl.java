package com.dvineservice.service.impl;

import com.dvinedao.domain.PageResult;
import com.dvinedao.domain.PermissionLevel;
import com.dvinedao.domain.Tour;
import com.dvinedao.domain.TourQueryParam;
import com.dvinedao.mapper.UserMapper;
import com.dvineservice.exception.TourSubmittedException;

import java.util.List;
import com.dvineservice.service.PendingTourService;
import com.dvineservice.service.TourOperationService;
import com.dvineservice.service.TourService;
import com.dvineservice.util.UserUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class TourServiceImpl implements TourService {
    @Autowired
    private TourOperationService tourOperationService;
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private PendingTourService pendingTourService;

    // Read operations (wrappers for consistent service layer routing)

    @Override
    public List<Tour> search(TourQueryParam tourQueryParam) {
        return tourOperationService.search(tourQueryParam);
    }

    @Override
    public PageResult<Tour> searchWithPagination(TourQueryParam tourQueryParam) {
        return tourOperationService.searchWithPagination(tourQueryParam);
    }


    @Override
    public Tour findById(Long tourId) {
        return tourOperationService.findById(tourId);
    }

    // Permission checking

    @Override
    public boolean canPerformDirectOperation(Long userId) {
        Integer userPermission = userMapper.findPermissionById(userId);
        return userPermission >= PermissionLevel.MANAGER;
    }

    // Permission-aware methods

    @Override
    @Transactional
    public void createTourWithPermissionCheck(Tour tour) {
        Long userId = UserUtil.getCurrentUserId();

        // Ensure the tour has a catalogue ID, defaulting to 1 if not specified
        if (tour.getCatalogueId() == null) {
            tour.setCatalogueId(1L); // Default to the first catalogue if not specified
        }

        if (canPerformDirectOperation(userId)) {
            log.info("Manager/Owner creating tour");
            tourOperationService.createTour(tour);
        } else {
            log.info("Partner submitting tour for approval");
            pendingTourService.submitTourCreation(tour, userId);
        }
    }

    @Override
    @Transactional
    public void updateTourWithPermissionCheck(Tour tour) {
        Long userId = UserUtil.getCurrentUserId();

        if (canPerformDirectOperation(userId)) {
            log.info("Manager/Owner updating tour");
            tourOperationService.updateTour(tour);
        } else {
            log.info("Partner submitting tour update for approval");
            pendingTourService.submitTourUpdate(tour, userId);
        }
    }

    @Override
    @Transactional
    public void deleteTourWithPermissionCheck(Long tourId) {
        Long userId = UserUtil.getCurrentUserId();

        if (canPerformDirectOperation(userId)) {
            log.info("Manager/Owner deleting tour");
            tourOperationService.deleteTour(tourId);
        } else {
            log.info("Partner submitting tour deletion for approval");
            pendingTourService.submitTourDeletion(tourId, userId);
        }
    }
}
