package com.dvineapi.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.dvinedao.annotation.PermissionCheck;
import com.dvinedao.annotation.TourOwnerCheck;
import com.dvinedao.domain.PageResult;
import com.dvinedao.domain.PermissionLevel;
import com.dvinedao.domain.ReturnResult;
import com.dvinedao.domain.Tour;
import com.dvinedao.domain.TourQueryParam;
import com.dvineservice.exception.TourSubmittedException;
import com.dvineservice.service.TourService;

@RestController
@RequestMapping("/tours")
public class TourController {
    @Autowired
    private TourService tourService;
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
        Long pendingTourId = tourService.createTourWithPermissionCheck(tour);
        if (pendingTourId != null) {
            // Return 202 Accepted to indicate the tour creation is pending approval
            throw new TourSubmittedException(pendingTourId);
        }
        return ReturnResult.success();
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
    public ReturnResult deleteTour(Long tourId) {
        boolean isDirectOperation = tourService.deleteTourWithPermissionCheck(tourId);
        if (!isDirectOperation) {
            // Return 202 Accepted to indicate the tour deletion is pending approval
            throw new TourSubmittedException();
        }
        return ReturnResult.success();
    }

}
