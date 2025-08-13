package com.dvineservice.service;

import com.dvinedao.domain.RegisterWithVerificationRequest;
import com.dvinedao.domain.ResetPasswordRequest;
import com.dvinedao.domain.TokenRefreshRequest;
import com.dvinedao.domain.TokenResponse;
import com.dvinedao.domain.User;

public interface AuthService {
    boolean sendVerificationCode(String email);
    TokenResponse registerWithEmailVerification(RegisterWithVerificationRequest request);
    TokenResponse register(User user);
    TokenResponse login(User user);
    void logout(Long userId);
    TokenResponse refreshToken(TokenRefreshRequest request);
    boolean sendPasswordResetCode(String email);
    boolean resetPassword(ResetPasswordRequest request);
}
