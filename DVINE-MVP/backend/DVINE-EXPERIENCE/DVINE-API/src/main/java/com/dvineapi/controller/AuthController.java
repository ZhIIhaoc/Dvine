package com.dvineapi.controller;

import com.dvinedao.domain.ReturnResult;
import com.dvinedao.domain.TokenRefreshRequest;
import com.dvinedao.domain.TokenResponse;
import com.dvinedao.domain.User;
import com.dvineservice.service.AuthService;
import com.dvineservice.util.TokenUtil;
import com.dvineservice.util.UserUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private TokenUtil tokenUtil;

    @PostMapping("/register")
    public ReturnResult register(@RequestBody User user){
        try {
            log.info("User registration: {}", user.getEmail());
            Map<String, String> tokens = authService.register(user);
            log.info("Tokens received from service: accessToken={}, refreshToken={}", 
                tokens.get("accessToken") != null ? "[PRESENT]" : "[NULL]", 
                tokens.get("refreshToken") != null ? "[PRESENT]" : "[NULL]");
            TokenResponse tokenResponse = new TokenResponse(
                tokens.get("accessToken"), 
                tokens.get("refreshToken")
            );
            log.info("TokenResponse created: accessToken={}, refreshToken={}", 
                tokenResponse.getAccessToken() != null ? "[PRESENT]" : "[NULL]", 
                tokenResponse.getRefreshToken() != null ? "[PRESENT]" : "[NULL]");
            ReturnResult result = ReturnResult.success(tokenResponse);
            log.info("ReturnResult created: code={}, msg={}, data={}", 
                result.getCode(), result.getMsg(), result.getData() != null ? "[PRESENT]" : "[NULL]");
            return result;
        } catch (IllegalArgumentException e) {
            log.info("Registration failed: {}", e.getMessage());
            return ReturnResult.error(e.getMessage());
        } catch (Exception e) {
            log.error("Registration failed with exception: ", e);
            return ReturnResult.error("Registration failed");
        }
    }

    @PostMapping("/login")
    public ReturnResult login(@RequestBody User user){
        try {
            log.info("User login: {}", user.getEmail());
            Map<String, String> tokens = authService.login(user);
            if(tokens != null){
                TokenResponse tokenResponse = new TokenResponse(
                    tokens.get("accessToken"), 
                    tokens.get("refreshToken")
                );
                return ReturnResult.success(tokenResponse);
            }
            return ReturnResult.error("Email or password is incorrect");
        } catch (IllegalArgumentException e) {
            log.info("Login failed: {}", e.getMessage());
            return ReturnResult.error(e.getMessage());
        } catch (Exception e) {
            return ReturnResult.error("Login failed");
        }
    }

    @PostMapping("/logout")
    public ReturnResult logout(){
        try {
            Long userId = UserUtil.getCurrentUserId();
            if (userId == null) {
                return ReturnResult.error("User not logged in");
            }
            
            String result = authService.logout(userId);
            return ReturnResult.success(result);
        } catch (Exception e) {
            return ReturnResult.error("Logout failed");
        }
    }
    
    @PostMapping("/refresh")
    public ReturnResult refreshToken(@RequestBody TokenRefreshRequest request){
        try {
            String refreshToken = request.getRefreshToken();
            
            if (refreshToken == null) {
                return ReturnResult.error("Refresh token required");
            }
            
            // Extract userId from refresh token
            Long userId = tokenUtil.getUserIdFromToken(refreshToken);
            if (userId == null) {
                return ReturnResult.error("Invalid refresh token");
            }
            
            Map<String, String> tokens = authService.refreshToken(refreshToken, userId);
            TokenResponse tokenResponse = new TokenResponse(
                tokens.get("accessToken"), 
                tokens.get("refreshToken")
            );
            return ReturnResult.success(tokenResponse);
        } catch (IllegalArgumentException e) {
            log.info("Token refresh failed: {}", e.getMessage());
            return ReturnResult.error(e.getMessage());
        } catch (Exception e) {
            return ReturnResult.error("Token refresh failed");
        }
    }
}
