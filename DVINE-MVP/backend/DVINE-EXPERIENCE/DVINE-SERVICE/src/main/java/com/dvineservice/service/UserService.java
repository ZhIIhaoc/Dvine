package com.dvineservice.service;

import com.dvinedao.domain.User;
import com.dvinedao.domain.UserQueryParam;

public interface UserService {
    UserQueryParam getUserProfileById(Long userId);
    void updateUserProfile(User user);
}
