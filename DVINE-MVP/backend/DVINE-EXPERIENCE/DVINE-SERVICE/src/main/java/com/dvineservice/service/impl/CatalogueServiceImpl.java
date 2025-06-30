package com.dvineservice.service.impl;

import com.dvinedao.annotation.PermissionCheck;
import com.dvinedao.annotation.CatalogueOwnerCheck;
import com.dvinedao.domain.*;
import com.dvinedao.mapper.CatalogueMapper;
import com.dvinedao.mapper.TourMapper;
import com.dvinedao.mapper.UserMapper;
import com.dvineservice.exception.NotFoundException;
import com.dvineservice.service.CatalogueService;
import com.dvineservice.service.TourService;
import com.dvineservice.util.UserUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CatalogueServiceImpl implements CatalogueService {
    @Autowired
    private CatalogueMapper catalogueMapper;
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private TourMapper tourMapper;
    @Autowired
    private TourService tourService;

    @Override
    public List<Catalogue> findAllCatalogues() {
        return catalogueMapper.findAllCatalogues();
    }

    @PermissionCheck(PermissionLevel.ADMIN)
    @Override
    public void createCatalogue(Catalogue catalogue) {
        // Set the creator ID and nickname for the catalogue
        Long currentUserId = UserUtil.getCurrentUserId();
        catalogue.setCreatorId(currentUserId);

        // Set the catalogue type based on the user's permission level
        Integer permission = userMapper.findPermissionById(currentUserId);
        if (PermissionLevel.isManager(permission) || PermissionLevel.isOwner(permission)) {
            catalogue.setType(CatalogueType.OFFICIAL_CATALOGUE);
        } else  {
            catalogue.setType(CatalogueType.PARTNER_CATALOGUE);
        }
        catalogueMapper.createCatalogue(catalogue);
    }

    @Override
    public Catalogue findCatalogueById(Long id) {
        Catalogue catalogue = catalogueMapper.findCatalogueById(id);
        if (catalogue == null) {
            throw new NotFoundException("Catalogue not found");
        }
        return catalogue;
    }

    @PermissionCheck(PermissionLevel.ADMIN)
    @CatalogueOwnerCheck
    @Override
    public void updateCatalogue(Catalogue catalogue) {
        // Update the catalogue
        catalogueMapper.updateCatalogue(catalogue);
    }

    @PermissionCheck(PermissionLevel.ADMIN)
    @CatalogueOwnerCheck
    @Transactional
    @Override
    public void deleteCatalogue(Long catalogueId) {
        // Check if catalogue exists first
        Catalogue catalogue = catalogueMapper.findCatalogueById(catalogueId);
        if (catalogue == null) {
            throw new NotFoundException("Catalogue does not exist");
        }

        // Find all tours in this catalogue
        List<Tour> tours = tourMapper.findByCatalogueId(catalogueId);
        tours.forEach(tour -> {
            tourService.deleteTour(tour.getTourId());
        });

        // Finally delete the catalogue
        catalogueMapper.deleteCatalogue(catalogueId);
    }
}
