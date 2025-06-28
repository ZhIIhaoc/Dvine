package com.dvinedao.mapper;

import com.dvinedao.domain.Catalogue;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CatalogueMapper {
    List<Catalogue> findAllCatalogues();
    void createCatalogue(Catalogue catalogue);
    Catalogue findCatalogueById(Long id);
}
