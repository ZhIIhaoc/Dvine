package com.dvineapi.controller;

import com.dvinedao.domain.PageResult;
import com.dvinedao.annotation.PermissionCheck;
import com.dvinedao.annotation.TourOwnerCheck;
import com.dvinedao.domain.PermissionLevel;
import com.dvinedao.domain.ReturnResult;
import com.dvinedao.domain.Tour;
import com.dvinedao.domain.TourQueryParam;
import com.dvineservice.service.TourService;
import com.dvineservice.exception.TourSubmittedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.multipart.MultipartFile;
import com.dvineservice.util.UserUtil;
import com.dvineservice.service.PendingTourService;
import com.dvineservice.service.TourImageService;

@RestController
@RequestMapping("/tours")
public class TourController {
    @Autowired
    private TourService tourService;
    @Autowired
    private TourImageService tourImageService;
    @Autowired
    private PendingTourService pendingTourService;

    @ResponseStatus(HttpStatus.OK)
    @GetMapping
    public ReturnResult search(TourQueryParam tourQueryParam) {
        List<Tour> tour = tourService.search(tourQueryParam);
        return ReturnResult.success(tour);
    }

    @ResponseStatus(HttpStatus.OK)
    @GetMapping("/page")
    public ReturnResult searchWithPagination(TourQueryParam tourQueryParam) {
        PageResult<Tour> pageResult = tourService.searchWithPagination(tourQueryParam);
        return ReturnResult.success(pageResult);
    }

    @ResponseStatus(HttpStatus.OK)
    @GetMapping("/{tourId}")
    public ReturnResult findById(@PathVariable Long tourId){
        Tour tour = tourService.findById(tourId);
        return ReturnResult.success(tour);
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    @PermissionCheck(PermissionLevel.PARTNER)
    public ReturnResult createTour(@RequestBody Tour tour) {
        boolean isDirectOperation = tourService.createTourWithPermissionCheck(tour);
        if (!isDirectOperation) {
            // Return 202 Accepted to indicate the tour creation is pending approval
            throw new TourSubmittedException();
        }
        return ReturnResult.success(tour);
    }

    /**
     * Create tour with images - handles approval workflow for partners
     */
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/with-images")
    @PermissionCheck(PermissionLevel.PARTNER)
    public ReturnResult createTourWithImages(
            @RequestParam("tourData") String tourDataJson,
            @RequestParam("files") MultipartFile[] files) {
        
        // Parse tour data from JSON string
        ObjectMapper objectMapper = new ObjectMapper();
        Tour tour;
        try {
            tour = objectMapper.readValue(tourDataJson, Tour.class);
        } catch (Exception e) {
            return ReturnResult.error("Invalid tour data format");
        }
        
        boolean isDirectOperation = tourService.createTourWithPermissionCheck(tour);
        
        if (isDirectOperation) {
            // Manager/Owner creating tour - can upload images immediately
            if (files != null && files.length > 0) {
                Long tourId = tour.getTourId();
                tourImageService.uploadTourImages(tourId, files, true, UserUtil.getCurrentUserId());
            }
            return ReturnResult.success(tour);
        } else {
            // Partner submitting for approval - store images temporarily
            if (files != null && files.length > 0) {
                // Store images in a temporary location or pending tour images table
                // This would need to be implemented in PendingTourService
                pendingTourService.submitTourCreationWithImages(tour, files, UserUtil.getCurrentUserId());
            } else {
                pendingTourService.submitTourCreation(tour, UserUtil.getCurrentUserId());
            }
            throw new TourSubmittedException();
        }
    }

    @ResponseStatus(HttpStatus.OK)
    @PutMapping
    @PermissionCheck(PermissionLevel.PARTNER)
    @TourOwnerCheck
    public ReturnResult updateTour(@RequestBody Tour tour) {
        boolean isDirectOperation = tourService.updateTourWithPermissionCheck(tour);
        if (!isDirectOperation) {
            // Return 202 Accepted to indicate the tour update is pending approval
            throw new TourSubmittedException();
        }
        return ReturnResult.success();
    }

    @ResponseStatus(HttpStatus.OK)
    @DeleteMapping
    @PermissionCheck(PermissionLevel.PARTNER)
    @TourOwnerCheck
    public ReturnResult deleteTour(@RequestParam Long tourId) {
        boolean isDirectOperation = tourService.deleteTourWithPermissionCheck(tourId);
        if (!isDirectOperation) {
            // Return 202 Accepted to indicate the tour deletion is pending approval
            throw new TourSubmittedException();
        }
        return ReturnResult.success();
    }

}
