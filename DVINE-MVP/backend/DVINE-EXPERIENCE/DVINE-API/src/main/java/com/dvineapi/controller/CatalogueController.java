package com.dvineapi.controller;

import com.dvinedao.domain.Catalogue;
import com.dvinedao.domain.ReturnResult;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/catalogues")
public class CatalogueController {

    @ResponseStatus(HttpStatus.OK)
    @GetMapping("/list")
    public ReturnResult list(){
        // TODO: Implement the logic to retrieve the catalogue list
        return ReturnResult.success("Catalogue List");
    }

    @ResponseStatus(HttpStatus.OK)
    @GetMapping("/{catalogueId}")
    public ReturnResult getCatalogueById(@PathVariable String catalogueId){
        // TODO: Implement the logic to retrieve a catalogue by its ID
        return ReturnResult.success("Catalogue INFO");
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping()
    public ReturnResult createCatalogue(@RequestBody Catalogue catalogueData){
        // TODO: Implement the logic to create a new catalogue
        return ReturnResult.success();
    }

    @ResponseStatus(HttpStatus.OK)
    @PutMapping()
    public ReturnResult updateCatalogue(@RequestBody Catalogue catalogueData){
        // TODO: Implement the logic to update an existing catalogue
        return ReturnResult.success();
    }

    @ResponseStatus(HttpStatus.OK)
    @DeleteMapping()
    public ReturnResult deleteCatalogue(@RequestParam Long catalogueId) {
        // TODO: Implement the logic to delete a catalogue by its ID
        return ReturnResult.success();
    }

}
