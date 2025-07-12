package com.dvineapi.controller;

import com.dvinedao.domain.PageResult;
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
    public ReturnResult createTour(@RequestBody Tour tour) {
        tourService.createTour(tour);
        return ReturnResult.success();
    }

    @ResponseStatus(HttpStatus.OK)
    @PutMapping
    public ReturnResult updateTour(@RequestBody Tour tour) {
        tourService.updateTour(tour);
        return ReturnResult.success();
    }

    @ResponseStatus(HttpStatus.OK)
    @DeleteMapping
    public ReturnResult deleteTour(Long tourId) {
        tourService.deleteTour(tourId);
        return ReturnResult.success();
    }

}
