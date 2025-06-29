package com.dvinedao.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TourQueryParam {
    private Long tourId; // Tour ID
    private Long catalogueId; // Catalogue ID to which the tour belongs
    private String title; // Tour title
    private String destination; // Tour destination
    private Double minPrice; // Minimum price for the tour
    private Double maxPrice; // Maximum price for the tour
}
