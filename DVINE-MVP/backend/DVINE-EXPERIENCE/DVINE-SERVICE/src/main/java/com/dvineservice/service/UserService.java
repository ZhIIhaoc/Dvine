package com.dvineservice.service;

import com.dvinedao.domain.User;
import com.dvinedao.domain.UserQueryParam;

import java.util.List;

public interface UserService {
    UserQueryParam getUserProfileById(Long userId);
    void updateUserProfile(User user);
    List<User> getUserList();
}
