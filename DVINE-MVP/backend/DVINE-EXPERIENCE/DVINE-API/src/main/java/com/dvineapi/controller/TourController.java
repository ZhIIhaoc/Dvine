package com.dvineapi.controller;

import com.dvinedao.domain.ReturnResult;
import com.dvinedao.domain.Tour;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tours")
public class TourController {
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

    @PostMapping
    public ReturnResult createTour(Tour tour) {
        // TODO: Implement the logic to create a new tour
        return ReturnResult.success();
    }

    @PutMapping
    public ReturnResult updateTour(Tour tour) {
        // TODO: Implement the logic to update an existing tour
        return ReturnResult.success();
    }

    @DeleteMapping
    public ReturnResult deleteTour(@RequestParam Long tourId) {
        // TODO: Implement the logic to delete a tour by its ID
        return ReturnResult.success();
    }

}
