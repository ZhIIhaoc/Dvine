package com.dvinedao.mapper;

import com.dvinedao.domain.Tour;
import com.dvinedao.domain.TourQueryParam;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface TourMapper {
    void createTour(Tour tour);

    List<Tour> search(TourQueryParam tourQueryParam);

    Tour findById(Long tourId);
}
