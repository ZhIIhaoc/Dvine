package com.dvineservice.service.impl;

import com.dvinedao.annotation.AdminPermissionCheck;
import com.dvinedao.domain.Catalogue;
import com.dvinedao.domain.CatalogueType;
import com.dvinedao.domain.PermissionLevel;
import com.dvinedao.mapper.CatalogueMapper;
import com.dvinedao.mapper.UserMapper;
import com.dvineservice.exception.NotFoundException;
import com.dvineservice.service.CatalogueService;
import com.dvineservice.util.UserUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CatalogueServiceImpl implements CatalogueService {
    @Autowired
    private CatalogueMapper catalogueMapper;
    @Autowired
    private UserMapper userMapper;

    @Override
    public List<Catalogue> findAllCatalogues() {
        return catalogueMapper.findAllCatalogues();
    }

    @AdminPermissionCheck
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
}
