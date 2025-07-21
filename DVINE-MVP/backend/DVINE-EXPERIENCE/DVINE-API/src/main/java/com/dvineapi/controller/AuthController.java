package com.dvineapi.controller;

import com.dvinedao.domain.EmailRequest;
import com.dvinedao.domain.RegisterWithVerificationRequest;
import com.dvinedao.domain.ResetPasswordRequest;
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

    @ResponseStatus(HttpStatus.OK)
    @PostMapping("/send-verification-code")
    public ReturnResult sendVerificationCode(@RequestBody EmailRequest emailRequest) {
        log.info("Send verification code to email: {}", emailRequest.getEmail());
        boolean success = authService.sendVerificationCode(emailRequest.getEmail());
        if (success) {
            return ReturnResult.success("Verification code sent successfully");
        } else {
            return ReturnResult.error("Failed to send verification code");
        }
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/register-with-verification")
    public ReturnResult registerWithVerification(@RequestBody RegisterWithVerificationRequest request) {
        log.info("User Register with verification: {}", request.getUser().getEmail());
        TokenResponse tokens = authService.registerWithEmailVerification(request);
        return ReturnResult.success(tokens);
    }

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

    @ResponseStatus(HttpStatus.OK)
    @PostMapping("/send-password-reset-code")
    public ReturnResult sendPasswordResetCode(@RequestBody EmailRequest emailRequest) {
        log.info("Send password reset code to email: {}", emailRequest.getEmail());
        boolean success = authService.sendPasswordResetCode(emailRequest.getEmail());
        if (success) {
            return ReturnResult.success("Password reset code sent successfully");
        } else {
            return ReturnResult.error("Failed to send password reset code");
        }
    }

    @ResponseStatus(HttpStatus.OK)
    @PostMapping("/reset-password")
    public ReturnResult resetPassword(@RequestBody ResetPasswordRequest request) {
        log.info("Reset password for email: {}", request.getEmail());
        boolean success = authService.resetPassword(request);
        if (success) {
            return ReturnResult.success("Password reset successfully");
        } else {
            return ReturnResult.error("Failed to reset password");
        }
    }
}
