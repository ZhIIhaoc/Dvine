package com.dvineservice.service.impl;

import com.dvinedao.annotation.PermissionCheck;
import com.dvinedao.annotation.CatalogueOwnerCheck;
import com.dvinedao.domain.Image;
import com.dvinedao.domain.PageResult;
import com.dvinedao.domain.PermissionLevel;
import com.dvinedao.domain.Tour;
import com.dvinedao.domain.TourQueryParam;
import java.util.ArrayList;
import com.dvinedao.mapper.TourMapper;
import com.dvineservice.exception.NotFoundException;
import com.dvineservice.service.ImageService;
import com.dvineservice.service.TourService;
import com.dvineservice.util.TourUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TourServiceImpl implements TourService {
    @Autowired
    private TourMapper tourMapper;
    @Autowired
    private ImageService imageService;



    @PermissionCheck(PermissionLevel.ADMIN)
    @CatalogueOwnerCheck
    @Transactional
    @Override
    public void createTour(Tour tour) {
        // Save the tour to the database
        tourMapper.createTour(tour);
        List<Image> images = TourUtil.getImages(tour);
        // Save the images using the ImageMapper
        imageService.createImages(images);
    }

    @Override
    public List<Tour> search(TourQueryParam tourQueryParam) {
        List<Tour> tour = tourMapper.search(tourQueryParam);
        if (tour.isEmpty()) {
            throw new NotFoundException("Tour not found");
        }
        return tour;
    }

    @Override
    public PageResult<Tour> searchWithPagination(TourQueryParam tourQueryParam) {
        // 获取总记录数
        long totalElements = tourMapper.countSearch(tourQueryParam);
        
        // 如果没有数据，返回空的分页结果
        if (totalElements == 0) {
            return new PageResult<>(new ArrayList<>(), tourQueryParam.getPage(), tourQueryParam.getSize(), 0);
        }
        
        // 获取当前页数据
        List<Tour> tours = tourMapper.search(tourQueryParam);
        
        // 构建分页结果
        return new PageResult<>(tours, tourQueryParam.getPage(), tourQueryParam.getSize(), totalElements);
    }

    @Override
    public Tour findById(Long tourId) {
        Tour tour = tourMapper.findById(tourId);
        if (tour == null) {
            throw new NotFoundException("Tour not found");
        }
        List<String> images = imageService.findByTourId(tourId).stream()
                .map(image -> image.getImageUrl()).toList();
        tour.setImages(images);
        return tour;
    }

    @PermissionCheck(PermissionLevel.ADMIN)
    @CatalogueOwnerCheck
    @Transactional
    @Override
    public void updateTour(Tour tour) {
        // Update the tour in the database
        tourMapper.updateTour(tour);
        imageService.updateImage(tour);
    }


    @PermissionCheck(PermissionLevel.ADMIN)
    @CatalogueOwnerCheck
    @Transactional
    @Override
    public void deleteTour(Long tourId) {
        // Check if tour exists first
        Tour tour = tourMapper.findById(tourId);
        if (tour == null) {
            throw new NotFoundException("Tour not found");
        }

        // Delete child records FIRST (images) to avoid FK constraint violation
        List<Image> images = imageService.findByTourId(tourId);
        if (!images.isEmpty()) {
            imageService.deleteImages(images);
        }

        // Then delete the parent record (tour)
        int deletedRow = tourMapper.deleteTour(tourId);
        if (deletedRow == 0) {
            throw new NotFoundException("Tour not found");
        }
    }
}
