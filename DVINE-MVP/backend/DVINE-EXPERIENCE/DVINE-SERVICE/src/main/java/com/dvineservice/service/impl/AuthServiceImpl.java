package com.dvineservice.service.impl;

import com.dvinedao.domain.PermissionLevel;
import com.dvinedao.domain.RegisterWithVerificationRequest;
import com.dvinedao.domain.ResetPasswordRequest;
import com.dvinedao.domain.TokenRefreshRequest;
import com.dvinedao.domain.TokenResponse;
import com.dvinedao.domain.User;
import com.dvinedao.mapper.UserMapper;
import com.dvineservice.exception.InvalidTokenException;
import com.dvineservice.exception.LoginCredentialIncorrectException;
import com.dvineservice.service.AuthService;
import com.dvineservice.service.EmailVerificationService;
import com.dvineservice.service.S3Service;
import com.dvineservice.util.TokenUtil;
import com.dvineservice.util.ValidationUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
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
    @Autowired
    private EmailVerificationService emailVerificationService;

    @Value("${aws.s3.default-avatar-url}")
    private String defaultAvatarUrl;
    
    @Override
    public boolean sendVerificationCode(String email) {
        return emailVerificationService.sendVerificationCode(email);
    }
    
    @Override
    public TokenResponse registerWithEmailVerification(RegisterWithVerificationRequest request) {
        User user = request.getUser();
        String verificationCode = request.getVerificationCode();
        
        ValidationUtil.validateUserRegistration(user);
    
        if (!emailVerificationService.verifyCode(user.getEmail(), verificationCode)) {
            throw new IllegalArgumentException("Invalid or expired verification code");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setAvatar(defaultAvatarUrl);
        userMapper.insertUser(user);
        
        emailVerificationService.removeVerificationCode(user.getEmail());
        TokenResponse tokens = tokenUtil.generateDoubleToken(user.getUserId());
        return tokens;
    }
    
    @Override
    public TokenResponse register(User user) {
        // Validate required fields are not null or whitespace-only
        ValidationUtil.validateUserRegistration(user);
        
        // Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setAvatar(defaultAvatarUrl);
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
            throw new LoginCredentialIncorrectException("Invalid email or password");
        }
        // Verify password
        if (!passwordEncoder.matches(loginInfo.getPassword(), userData.getPassword())) {
            throw new LoginCredentialIncorrectException("Invalid email or password");
        }
        // Generate tokens
        TokenResponse tokens = tokenUtil.generateDoubleToken(userData.getUserId());
        return tokens;
    }
    
    @Override
    public void logout(Long userId) {
        // Remove refresh token from Redis
        String redisKey = REFRESH_TOKEN_PREFIX + userId;
        stringRedisTemplate.delete(redisKey);
        log.info("User logged out successfully with ID: {}", userId);
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
            throw new InvalidTokenException("Invalid refresh token");
        }
        // Generate new tokens
        TokenResponse tokens = tokenUtil.generateDoubleToken(userId);

        log.info("Tokens refreshed successfully for user ID: {}", userId);
        return tokens;
    }
    
    @Override
    public boolean sendPasswordResetCode(String email) {
        return emailVerificationService.sendVerificationCode(email);
    }
    
    @Override
    public boolean resetPassword(ResetPasswordRequest request) {
        String email = request.getEmail();
        String verificationCode = request.getVerificationCode();
        String newPassword = request.getNewPassword();
        
        // Validate input
        if (!StringUtils.hasText(email) || !StringUtils.hasText(verificationCode) || !StringUtils.hasText(newPassword)) {
            throw new IllegalArgumentException("Email, verification code, and new password are required");
        }
        
        // Check if user exists
        User user = userMapper.selectUserByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("User with this email does not exist");
        }
        
        // Verify the verification code
        if (!emailVerificationService.verifyCode(email, verificationCode)) {
            throw new IllegalArgumentException("Invalid or expired verification code");
        }

        // Check if new password is the same as the old password
        if(passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new IllegalArgumentException("New password cannot be the same as the old password");
        }
        
        // Update password
        String encodedPassword = passwordEncoder.encode(newPassword);
        user.setPassword(encodedPassword);
        userMapper.updateUser(user);
        
        // Remove verification code
        emailVerificationService.removeVerificationCode(email);
        
        log.info("Password reset successfully for user: {}", email);
        return true;
    }
}
