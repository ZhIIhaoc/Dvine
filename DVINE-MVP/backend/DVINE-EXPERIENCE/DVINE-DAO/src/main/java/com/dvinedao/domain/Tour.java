package com.dvinedao.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Represents a Catalogue entity in the system.
 * This class is currently empty and can be extended with properties and methods as needed.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Tour {
    private Long tourId; // Tour ID
    private Long catalogueId; // Catalogue ID to which the tour belongs
    private String title; // Tour title
    private String description; // Tour description
    private String destination; // Tour destination
    private Double price;
    private String primaryImageUrl; // URL of the primary image for the tour
    private List<String> images; // List of image URLs associated with the tour
}
