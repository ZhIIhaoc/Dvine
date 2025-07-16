package com.dvinedao.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeaturedTour {
    private Long featuredTourId;
    private Long tourId;
    private Integer displayOrder;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

}