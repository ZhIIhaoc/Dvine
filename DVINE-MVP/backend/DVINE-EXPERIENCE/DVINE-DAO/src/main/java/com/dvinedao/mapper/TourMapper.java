package com.dvinedao.mapper;

import com.dvinedao.domain.Tour;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface TourMapper {
    void createTour(Tour tour);
}
