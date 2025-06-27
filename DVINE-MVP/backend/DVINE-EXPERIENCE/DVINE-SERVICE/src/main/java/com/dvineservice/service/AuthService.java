package com.dvineservice.service;

import com.dvinedao.domain.TokenRefreshRequest;
import com.dvinedao.domain.TokenResponse;
import com.dvinedao.domain.User;

public interface AuthService {
    TokenResponse register(User user);
    TokenResponse login(User user);
    String logout(Long userId);
    TokenResponse refreshToken(TokenRefreshRequest request);
}
