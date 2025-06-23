package com.dvineservice.service.impl;

import com.dvinedao.domain.User;
import com.dvinedao.mapper.UserMapper;
import com.dvineservice.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {
    @Autowired
    private UserMapper userMapper;
    @Override
    public void register(User user) {
        userMapper.insertUser(user);
    }
}
