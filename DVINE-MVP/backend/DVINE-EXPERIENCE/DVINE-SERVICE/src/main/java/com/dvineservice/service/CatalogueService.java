package com.dvineservice.service;

import com.dvinedao.domain.Catalogue;

import java.util.List;

public interface CatalogueService {
    List<Catalogue> findAllCatalogues();
    void createCatalogue(Catalogue catalogue);
    Catalogue findCatalogueById(Long id);
    void updateCatalogue(Catalogue catalogue);
    void deleteCatalogue(Long catalogueId);
}
