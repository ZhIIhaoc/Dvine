package com.dvineapi.controller;

import com.dvinedao.annotation.PermissionCheck;
import com.dvinedao.domain.FeaturedTour;
import com.dvinedao.domain.PermissionLevel;
import com.dvinedao.domain.ReturnResult;
import com.dvinedao.domain.Tour;
import com.dvineservice.service.FeaturedTourService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/featured-tours")
public class FeaturedTourController {

    @Autowired
    private FeaturedTourService featuredTourService;

    /**
     * GET /featured-tours - Get featured tours for main page (public access)
     */
    @ResponseStatus(HttpStatus.OK)
    @GetMapping
    public ReturnResult getFeaturedToursForMainPage() {
        List<Tour> featuredTours = featuredTourService.getFeaturedToursForMainPage();
        return ReturnResult.success(featuredTours);
    }

    /**
     * GET /featured-tours/manage - Get all featured tours for management (Manager only)
     */
    @ResponseStatus(HttpStatus.OK)
    @GetMapping("/manage")
    @PermissionCheck(PermissionLevel.MANAGER)
    public ReturnResult getAllFeaturedTours() {
        List<FeaturedTour> featuredTours = featuredTourService.getAllFeaturedTours();
        return ReturnResult.success(featuredTours);
    }

    /**
     * POST /featured-tours - Add a tour to featured list (Manager only)
     */
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    @PermissionCheck(PermissionLevel.MANAGER)
    public ReturnResult addFeaturedTour(@RequestParam Long tourId) {
        featuredTourService.addFeaturedTour(tourId);
        return ReturnResult.success();
    }

    /**
     * DELETE /featured-tours - Remove a tour from featured list (Manager only)
     */
    @ResponseStatus(HttpStatus.OK)
    @DeleteMapping
    @PermissionCheck(PermissionLevel.MANAGER)
    public ReturnResult removeFeaturedTour(@RequestParam Long tourId) {
        featuredTourService.removeFeaturedTour(tourId);
        return ReturnResult.success();
    }

    /**
     * PUT /featured-tours/reorder - Reorder featured tours (Manager only)
     */
    @ResponseStatus(HttpStatus.OK)
    @PutMapping("/reorder")
    @PermissionCheck(PermissionLevel.MANAGER)
    public ReturnResult reorderFeaturedTours(@RequestBody List<FeaturedTour> reorderedTours) {
        featuredTourService.reorderFeaturedTours(reorderedTours);
        return ReturnResult.success();
    }
}