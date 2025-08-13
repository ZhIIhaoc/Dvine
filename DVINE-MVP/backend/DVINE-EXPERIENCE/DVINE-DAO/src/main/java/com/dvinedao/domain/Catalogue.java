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
    private String description; // Catalogue description
    private String coverImage; // Catalogue cover image URL
}
