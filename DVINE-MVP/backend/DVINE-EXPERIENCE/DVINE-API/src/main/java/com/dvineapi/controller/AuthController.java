package com.dvineapi.controller;

import com.dvinedao.domain.ReturnResult;
import com.dvinedao.domain.TokenRefreshRequest;
import com.dvinedao.domain.TokenResponse;
import com.dvinedao.domain.User;
import com.dvineservice.service.AuthService;
import com.dvineservice.util.UserUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    
    @Autowired
    private AuthService authService;

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/register")
    public ReturnResult register(@RequestBody User user){
        log.info("User Register:{}", user);
        TokenResponse tokens = authService.register(user);
        return ReturnResult.success(tokens);
    }

    @ResponseStatus(HttpStatus.OK)
    @PostMapping("/login")
    public ReturnResult login(@RequestBody User user){
        log.info("User login: {}", user.getEmail());
        TokenResponse tokens = authService.login(user);
        return ReturnResult.success(tokens);

    }

    @ResponseStatus(HttpStatus.OK)
    @PostMapping("/logout")
    public ReturnResult logout(){
        Long userId = UserUtil.getCurrentUserId();
        log.info("User logout: {}", userId);
        authService.logout(userId);
        return ReturnResult.success();
    }

    @ResponseStatus(HttpStatus.OK)
    @PostMapping("/refresh")
    public ReturnResult refreshToken(@RequestBody TokenRefreshRequest request){
        log.info("Refresh Token:{}", request);
        TokenResponse tokens = authService.refreshToken(request);
        return ReturnResult.success(tokens);

    }
}
