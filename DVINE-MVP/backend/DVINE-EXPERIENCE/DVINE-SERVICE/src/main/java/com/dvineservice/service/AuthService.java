package com.dvineservice.service;

import com.dvinedao.domain.User;
import java.util.Map;

public interface AuthService {
    Map<String, String> register(User user);
    Map<String, String> login(User user);
    String logout(Long userId);
    Map<String, String> refreshToken(String refreshToken, Long userId);
}
