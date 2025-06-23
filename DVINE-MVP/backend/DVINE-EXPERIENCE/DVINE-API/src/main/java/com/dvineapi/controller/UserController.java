package com.dvineapi.controller;

import com.dvinedao.domain.ReturnResult;
import com.dvinedao.domain.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/users")
public class UserController {
    @GetMapping("/profile")
    public ReturnResult getUserProfile(){
        // TODO: implement get user profile feature
        return ReturnResult.success("<UNK>");
    }

    @PutMapping("/profile")
    public ReturnResult updateUserProfile(@RequestBody User user){
        // TODO: implement update user profile feature
        return ReturnResult.success();
    }
}
