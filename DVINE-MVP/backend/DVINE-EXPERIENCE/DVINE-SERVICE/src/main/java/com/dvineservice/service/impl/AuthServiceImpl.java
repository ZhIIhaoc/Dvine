package com.dvineservice.service.impl;

import com.dvinedao.domain.TokenRefreshRequest;
import com.dvinedao.domain.TokenResponse;
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
    public TokenResponse register(User user) {
        // Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // Insert user
        userMapper.insertUser(user);
        // Generate double tokens
        TokenResponse tokens = tokenUtil.generateDoubleToken(user.getUserId());
        return tokens;
    }

    @Override
    public TokenResponse login(User loginInfo) {
        // Find user by email
        User userData = userMapper.selectUserByEmail(loginInfo.getEmail());
        if (userData == null) {
            return null;
        }
        // Verify password
        if (!passwordEncoder.matches(loginInfo.getPassword(), userData.getPassword())) {
            return null;
        }
        // Generate tokens
        TokenResponse tokens = tokenUtil.generateDoubleToken(userData.getUserId());
        return tokens;
    }
    
    @Override
    public String logout(Long userId) {
        // Remove refresh token from Redis
        String redisKey = REFRESH_TOKEN_PREFIX + userId;
        stringRedisTemplate.delete(redisKey);

        log.info("User logged out successfully with ID: {}", userId);
        return "Logout successful";
    }
    
    @Override
    public TokenResponse refreshToken(TokenRefreshRequest request) {
        String refreshToken = request.getRefreshToken();
        Long userId = tokenUtil.getUserIdFromToken(refreshToken);

        if (!StringUtils.hasText(refreshToken) || userId == null) {
            throw new IllegalArgumentException("Refresh token and user ID are required");
        }
        
        // Verify refresh token
        if (!tokenUtil.verifyRefreshToken(refreshToken, userId)) {
            throw new IllegalArgumentException("Invalid refresh token");
        }
        // Generate new tokens
        TokenResponse tokens = tokenUtil.generateDoubleToken(userId);

        log.info("Tokens refreshed successfully for user ID: {}", userId);
        return tokens;
    }
}
