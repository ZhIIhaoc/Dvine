package com.dvineservice.service.impl;

import com.dvinedao.domain.User;
import com.dvinedao.domain.UserQueryParam;
import com.dvinedao.mapper.UserMapper;
import com.dvineservice.service.UserService;
import com.dvineservice.util.UserUtil;
import org.apache.coyote.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserMapper userMapper;

    @Override
    public UserQueryParam getUserProfileById(Long userId) {
        return userMapper.findUserById(userId);
    }

    @Override
    public void updateUserProfile(User user) {
        if (user.isEmptyPatch()) {
            throw new IllegalArgumentException("You should patch at least one field");
        }
        user.setUserId(UserUtil.getCurrentUserId());
        userMapper.updateUser(user);
    }
}
