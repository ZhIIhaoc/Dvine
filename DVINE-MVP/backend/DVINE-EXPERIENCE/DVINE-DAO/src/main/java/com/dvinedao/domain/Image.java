package com.dvinedao.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Objects;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Image {
    private Long imageId;
    private Long tourId;
    private String imageUrl;
    private String caption;
    private Boolean isPrimary;


    /*
     * Checks if two Image objects are equal based on their properties.
     * ImageId is not considered in equality check as it may be auto-generated.
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;

        Image image = (Image) obj;
        return Objects.equals(imageUrl, image.imageUrl) &&
                Objects.equals(tourId, image.tourId) &&
                Objects.equals(caption, image.caption) &&
                Objects.equals(isPrimary, image.isPrimary);
    }

    @Override
    public int hashCode() {
        return Objects.hash(imageUrl, tourId, caption, isPrimary);
    }
}
