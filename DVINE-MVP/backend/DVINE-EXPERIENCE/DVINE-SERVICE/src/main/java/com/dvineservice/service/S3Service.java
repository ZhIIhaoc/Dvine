package com.dvineservice.service;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface S3Service {
    String uploadFile(Long entityId, MultipartFile file, String prefix);
    boolean deleteFile(String fileUrl);
    int deleteFiles(List<String> fileUrls);
    boolean fileExists(String fileUrl);
}