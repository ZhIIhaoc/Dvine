package com.dvineapi.controller;

import com.dvinedao.domain.ReturnResult;
import com.dvinedao.domain.Tour;
import com.dvineservice.service.TourService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tours")
public class TourController {
    @Autowired
    private TourService tourService;
    @GetMapping
    public ReturnResult getToursListByCatalogueId(@RequestParam Long catalogueId){
        // TODO: Implement the logic to retrieve tours by catalogue ID
        return ReturnResult.success("Tours List for Catalogue ID");
    }

    @GetMapping("/{tourId}")
    public ReturnResult getTourById(@PathVariable Long tourId){
        // TODO: Implement the logic to retrieve a tour by its ID
        return ReturnResult.success("Tour INFO for ID");
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
