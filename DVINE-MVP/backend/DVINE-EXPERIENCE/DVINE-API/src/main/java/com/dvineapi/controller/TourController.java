package com.dvineapi.controller;

import com.dvinedao.domain.ReturnResult;
import com.dvinedao.domain.Tour;
import com.dvinedao.domain.TourQueryParam;
import com.dvineservice.service.TourService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tours")
public class TourController {
    @Autowired
    private TourService tourService;
    @GetMapping
    public ReturnResult search(TourQueryParam tourQueryParam) {
        List<Tour> tour = tourService.search(tourQueryParam);
        return ReturnResult.success(tour);
    }

    @GetMapping("/{tourId}")
    public ReturnResult findById(@PathVariable Long tourId){
        Tour tour = tourService.findById(tourId);
        return ReturnResult.success(tour);
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public ReturnResult createTour(@RequestBody Tour tour) {
        tourService.createTour(tour);
        return ReturnResult.success();
    }

    @PutMapping
    public ReturnResult updateTour(@RequestBody Tour tour) {
        // TODO: Implement the logic to update an existing tour
        return ReturnResult.success();
    }

    @DeleteMapping
    public ReturnResult deleteTour(@RequestParam Long tourId) {
        // TODO: Implement the logic to delete a tour by its ID
        return ReturnResult.success();
    }

}
