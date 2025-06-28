package com.dvineservice.service.impl;

import com.dvinedao.annotation.AdminPermissionCheck;
import com.dvinedao.domain.Catalogue;
import com.dvinedao.domain.CatalogueType;
import com.dvinedao.domain.PermissionLevel;
import com.dvinedao.mapper.CatalogueMapper;
import com.dvinedao.mapper.UserMapper;
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
        Long currentUserId = UserUtil.getCurrentUserId();
        catalogue.setCreatorId(currentUserId);
        Integer permission = userMapper.findPermissionById(currentUserId);
        if (PermissionLevel.isManager(permission) || PermissionLevel.isOwner(permission)) {
            catalogue.setType(CatalogueType.OFFICIAL_CATALOGUE);
        } else  {
            catalogue.setType(CatalogueType.PARTNER_CATALOGUE);
        }
        catalogueMapper.createCatalogue(catalogue);
    }
}
