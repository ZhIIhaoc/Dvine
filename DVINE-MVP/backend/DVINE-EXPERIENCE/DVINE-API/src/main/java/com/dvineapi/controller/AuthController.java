package com.dvineapi.controller;

import com.dvinedao.domain.ReturnResult;
import com.dvinedao.domain.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/auth")
public class AuthController {

    @PostMapping("/register")
    public ReturnResult register(@RequestBody User user){
        // TODO: need to implement the register feature
        return ReturnResult.success();
    }

    @PostMapping("/login")
    public ReturnResult login(@RequestBody User user){
        // TODO: need to implement the login feature
        return ReturnResult.success();
    }

    @PostMapping("/logout")
    public ReturnResult logout(@RequestBody User user){
        // TODO: need to implement the logout feature
        return ReturnResult.success();
    }

}
