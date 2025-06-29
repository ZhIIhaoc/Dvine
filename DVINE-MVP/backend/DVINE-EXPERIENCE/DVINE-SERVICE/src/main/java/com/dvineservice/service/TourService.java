package com.dvineservice.service;

import com.dvinedao.domain.Tour;
import com.dvinedao.domain.TourQueryParam;

import java.util.List;

public interface TourService {
    void createTour(Tour tour);
    List<Tour> search(TourQueryParam tourQueryParam);
    Tour findById(Long tourId);
}
