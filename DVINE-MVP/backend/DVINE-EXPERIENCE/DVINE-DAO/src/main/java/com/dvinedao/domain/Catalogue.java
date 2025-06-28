package com.dvinedao.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class Catalogue {
    private Long catalogueId; // Catalogue ID
    private String title; // Catalogue title
    private Integer type; // Catalogue type (e.g., 0 for official catalogue, 1 for partner catalogue)
    private String description; // Catalogue description
    private Long creatorId; // ID of the user who created the catalogue
}
