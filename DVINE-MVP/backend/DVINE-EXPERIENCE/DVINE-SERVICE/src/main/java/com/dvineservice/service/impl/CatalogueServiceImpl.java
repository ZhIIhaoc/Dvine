package com.dvineservice.service.impl;

import com.dvinedao.domain.*;
import com.dvinedao.mapper.CatalogueMapper;
import com.dvinedao.mapper.TourMapper;
import com.dvineservice.exception.NotFoundException;
import com.dvineservice.service.CatalogueService;
import com.dvineservice.service.TourService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CatalogueServiceImpl implements CatalogueService {
    @Autowired
    private CatalogueMapper catalogueMapper;
    @Autowired
    private TourMapper tourMapper;
    @Autowired
    private TourService tourService;

    /**
     * Helper method to ensure catalogue exists
     * @param catalogueId the catalogue ID to check
     * @return the catalogue if it exists
     * @throws NotFoundException if catalogue does not exist
     */
    private Catalogue ensureCatalogueExists(Long catalogueId) {
        Catalogue catalogue = catalogueMapper.findCatalogueById(catalogueId);
        if (catalogue == null) {
            throw new NotFoundException("Catalogue not found");
        }
        return catalogue;
    }

    @Override
    public List<Catalogue> findAllCatalogues() {
        return catalogueMapper.findAllCatalogues();
    }

    @Override
    public void createCatalogue(Catalogue catalogue) {
        catalogueMapper.createCatalogue(catalogue);
    }

    @Override
    public Catalogue findCatalogueById(Long id) {
        return ensureCatalogueExists(id);
    }

    @Override
    public void updateCatalogue(Catalogue catalogue) {
        // Check if catalogue exists first
        ensureCatalogueExists(catalogue.getCatalogueId());
        catalogueMapper.updateCatalogue(catalogue);
    }

    @Transactional
    @Override
    public void deleteCatalogue(Long catalogueId) {
        // Check if catalogue exists first
        ensureCatalogueExists(catalogueId);

        // Find all tours in this catalogue
        List<Tour> tours = tourMapper.findByCatalogueId(catalogueId);
        tours.forEach(tour -> tourService.deleteTour(tour.getTourId()));

        // Finally delete the catalogue
        catalogueMapper.deleteCatalogue(catalogueId);
    }
}
