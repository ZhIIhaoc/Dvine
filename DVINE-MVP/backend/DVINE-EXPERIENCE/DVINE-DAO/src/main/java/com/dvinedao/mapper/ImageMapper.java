package com.dvinedao.mapper;

import com.dvinedao.domain.Image;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ImageMapper {
    void createImages(List<Image> images);
    List<Image> findByTourId(Long tourId);

}
