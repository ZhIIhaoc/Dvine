package com.dvineservice.service.impl;

import com.dvinedao.domain.User;
import com.dvinedao.mapper.UserMapper;
import com.dvineservice.service.AuthService;
import com.dvineservice.util.TokenUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthServiceImpl implements AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);
    private static final String REFRESH_TOKEN_PREFIX = "refresh_token";
    
    @Autowired
    private TokenUtil tokenUtil;
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private StringRedisTemplate stringRedisTemplate;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    
    @Override
    public Map<String, String> register(User user) {
        // Validate required fields
        if (!StringUtils.hasText(user.getEmail()) || !StringUtils.hasText(user.getPassword())) {
            throw new IllegalArgumentException("Email and password are required");
        }
        
        // Check if user already exists
        User existingUser = new User();
        existingUser.setEmail(user.getEmail());
        User existing = userMapper.selectUserByEmail(existingUser.getEmail());
        if (existing != null) {
            throw new IllegalArgumentException("User with this email already exists");
        }
        
        // Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Insert user
        userMapper.insertUser(user);
        
        // Generate tokens
        String accessToken = tokenUtil.generateToken(user.getUserId());
        String refreshToken = tokenUtil.generateRefreshToken(user.getUserId());
        
        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", accessToken);
        tokens.put("refreshToken", refreshToken);
        
        log.info("User registered successfully with email: {}", user.getEmail());
        return tokens;
    }

    @Override
    public Map<String, String> login(User user) {
        // Validate required fields
        if (!StringUtils.hasText(user.getEmail()) || !StringUtils.hasText(user.getPassword())) {
            throw new IllegalArgumentException("Email and password are required");
        }
        
        // Find user by email
        User existingUser = userMapper.selectUserByEmail(user.getEmail());
        if (existingUser == null) {
            return null;
        }
        
        // Verify password
        if (!passwordEncoder.matches(user.getPassword(), existingUser.getPassword())) {
            return null;
        }
        
        // Generate tokens
        String accessToken = tokenUtil.generateToken(existingUser.getUserId());
        String refreshToken = tokenUtil.generateRefreshToken(existingUser.getUserId());
        
        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", accessToken);
        tokens.put("refreshToken", refreshToken);
        
        log.info("User logged in successfully with email: {}", user.getEmail());
        return tokens;
    }
    
    @Override
    public String logout(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required");
        }
        
        // Remove refresh token from Redis
        String redisKey = REFRESH_TOKEN_PREFIX + userId;
        stringRedisTemplate.delete(redisKey);
        
        log.info("User logged out successfully with ID: {}", userId);
        return "Logout successful";
    }
    
    @Override
    public Map<String, String> refreshToken(String refreshToken, Long userId) {
        if (!StringUtils.hasText(refreshToken) || userId == null) {
            throw new IllegalArgumentException("Refresh token and user ID are required");
        }
        
        // Verify refresh token
        if (!tokenUtil.verifyRefreshToken(refreshToken, userId)) {
            throw new IllegalArgumentException("Invalid refresh token");
        }
        
        // Generate new tokens
        String newAccessToken = tokenUtil.generateToken(userId);
        String newRefreshToken = tokenUtil.generateRefreshToken(userId);
        
        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", newAccessToken);
        tokens.put("refreshToken", newRefreshToken);
        
        log.info("Tokens refreshed successfully for user ID: {}", userId);
        return tokens;
    }
}
