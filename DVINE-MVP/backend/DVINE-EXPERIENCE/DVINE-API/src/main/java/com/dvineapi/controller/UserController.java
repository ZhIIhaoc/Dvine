package com.dvineapi.controller;

import com.dvinedao.annotation.PermissionCheck;
import com.dvinedao.domain.PermissionLevel;
import com.dvinedao.domain.ReturnResult;
import com.dvinedao.domain.User;
import com.dvinedao.domain.UserQueryParam;
import com.dvineservice.service.UserService;
import com.dvineservice.util.UserUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {
    private static final Logger log = LoggerFactory.getLogger(UserController.class);
    
    @Autowired
    private UserService userService;

    @ResponseStatus(HttpStatus.OK)
    @GetMapping("/profile")
    public ReturnResult getUserProfile(){
        log.info("getUserProfile: {}", UserUtil.getCurrentUserId());
        UserQueryParam user = userService.getUserProfileById(UserUtil.getCurrentUserId());
        return ReturnResult.success(user);
    }

    @ResponseStatus(HttpStatus.OK)
    @PutMapping("/profile")
    public ReturnResult updateUserProfile(@RequestBody User user){
        log.info("updateUserProfile: {}", user);
        userService.updateUserProfile(user);
        return ReturnResult.success();
    }

    @ResponseStatus(HttpStatus.OK)
    @GetMapping("/list")
    @PermissionCheck(PermissionLevel.MANAGER)
    public ReturnResult getUserList(){
        log.info("getUserList");
        List<User> userList = userService.getUserList();
        return ReturnResult.success(userList);
    }
}
