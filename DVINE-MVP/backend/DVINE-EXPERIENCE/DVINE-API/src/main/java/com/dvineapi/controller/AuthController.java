package com.dvineapi.controller;

import com.dvinedao.domain.ReturnResult;
import com.dvinedao.domain.User;
import com.dvineservice.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ReturnResult register(@RequestBody User user){
        log.info("user register: {}", user);
        String jwt = authService.register(user);
        return ReturnResult.success(jwt);
    }

    @PostMapping("/login")
    public ReturnResult login(@RequestBody User user){
        log.info("user login: {}", user);
        return ReturnResult.success();
    }

    @PostMapping("/logout")
    public ReturnResult logout(@RequestBody User user){
        // TODO: need to implement the logout feature
        return ReturnResult.success();
    }

}
