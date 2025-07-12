package com.dvineapi.controller;

import com.dvinedao.domain.Catalogue;
import com.dvinedao.domain.ReturnResult;
import com.dvineservice.service.CatalogueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/catalogues")
public class CatalogueController {
    @Autowired
    private CatalogueService catalogueService;

    @ResponseStatus(HttpStatus.OK)
    @GetMapping("/list")
    public ReturnResult list(){
        List<Catalogue> catalogues = catalogueService.findAllCatalogues();
        return ReturnResult.success(catalogues);
    }

    @ResponseStatus(HttpStatus.OK)
    @GetMapping("/{catalogueId}")
    public ReturnResult getCatalogueById(@PathVariable Long catalogueId){
        Catalogue catalogue = catalogueService.findCatalogueById(catalogueId);
        return ReturnResult.success(catalogue);
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public ReturnResult createCatalogue(@RequestBody Catalogue catalogueData){
        catalogueService.createCatalogue(catalogueData);
        return ReturnResult.success();
    }

    @ResponseStatus(HttpStatus.OK)
    @PutMapping
    public ReturnResult updateCatalogue(@RequestBody Catalogue catalogueData){
        catalogueService.updateCatalogue(catalogueData);
        return ReturnResult.success();
    }

    @ResponseStatus(HttpStatus.OK)
    @DeleteMapping
    public ReturnResult deleteCatalogue(Long catalogueId) {
        catalogueService.deleteCatalogue(catalogueId);
        return ReturnResult.success();
    }

}
