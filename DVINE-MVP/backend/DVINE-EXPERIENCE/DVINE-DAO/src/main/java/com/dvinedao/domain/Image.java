package com.dvinedao.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Image {
    private Long imageId;
    private Long tourId;
    private String imageUrl;
    private String caption;
    private Boolean isPrimary;
}
