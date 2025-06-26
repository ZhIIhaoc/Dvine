package com.dvineapi.controller;

import com.dvinedao.domain.ReturnResult;
import com.dvinedao.domain.User;
import com.dvinedao.domain.UserQueryParam;
import com.dvineservice.service.UserService;
import com.dvineservice.util.UserUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserService userService;
    @GetMapping("/profile")
    public ReturnResult getUserProfile(){
        UserQueryParam user = userService.getUserProfileById(UserUtil.getCurrentUserId());
        return ReturnResult.success(user);
    }

    @PutMapping("/profile")
    public ReturnResult updateUserProfile(@RequestBody User user){
        userService.updateUserProfile(user);
        return ReturnResult.success();
    }
}
