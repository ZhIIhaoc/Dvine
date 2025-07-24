 package com.dvineapi.controller;

import com.dvinedao.domain.ReturnResult;
import com.dvinedao.domain.User;
import com.dvinedao.domain.UserQueryParam;
import com.dvineservice.service.S3Service;
import com.dvineservice.service.UserService;
import com.dvineservice.util.UserUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/avatar")
@CrossOrigin
public class AvatarUploadController {
    
    @Autowired
    private S3Service s3Service;
    
    @Value("${aws.s3.default-avatar-url}")
    private String defaultAvatarUrl;

    @Autowired
    private UserService userService;
    @PostMapping("/upload")
    @ResponseStatus(HttpStatus.OK)
    public ReturnResult uploadAvatar(@RequestParam("file") MultipartFile file) {
        Long userId = UserUtil.getCurrentUserId();
        String avatarUrl = s3Service.uploadUserAvatar(userId, file);

        String oldAvatarUrl = userService.getUserProfileById(userId).getAvatar();

        User user = new User();
        user.setUserId(userId);
        user.setAvatar(avatarUrl);
        userService.updateUserProfile(user);

        if (oldAvatarUrl != null && !oldAvatarUrl.isEmpty() &&
            !oldAvatarUrl.contains("default")) {
            s3Service.deleteFile(oldAvatarUrl);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("avatarUrl", avatarUrl);
        result.put("message", "avatar upload success");
        result.put("userId", userId);

        log.info("user {} avatar upload success : {}", userId, avatarUrl);
        return ReturnResult.success(result);
    }

    @GetMapping("/info")
    @ResponseStatus(HttpStatus.OK)
    public ReturnResult getAvatarInfo() {
        Long userId = UserUtil.getCurrentUserId();

        UserQueryParam userProfile = userService.getUserProfileById(userId);

        Map<String, Object> result = new HashMap<>();
        result.put("userId", userId);
        result.put("avatarUrl", userProfile.getAvatar());
        result.put("nickName", userProfile.getNickName());

        return ReturnResult.success(result);
    }
}