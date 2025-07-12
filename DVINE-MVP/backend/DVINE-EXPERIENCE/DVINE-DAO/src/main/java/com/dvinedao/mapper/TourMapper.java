package com.dvinedao.mapper;

import com.dvinedao.domain.Tour;
import com.dvinedao.domain.TourQueryParam;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface TourMapper {
    void createTour(Tour tour);

    List<Tour> search(TourQueryParam tourQueryParam);
    
    long countSearch(TourQueryParam tourQueryParam);

    Tour findById(Long tourId);

    void updateTour(Tour tour);

    int deleteTour(Long tourId);

    List<Tour> findByCatalogueId(Long id);
}
