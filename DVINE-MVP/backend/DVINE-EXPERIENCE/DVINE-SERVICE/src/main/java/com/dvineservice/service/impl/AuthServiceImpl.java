package com.dvineservice.service.impl;

import com.dvinedao.domain.User;
import com.dvinedao.mapper.UserMapper;
import com.dvineservice.service.AuthService;
import com.dvineservice.util.TokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {
    @Autowired
    private TokenUtil tokenUtil;
    @Autowired
    private UserMapper userMapper;
    @Override
    public String register(User user) {
        userMapper.insertUser(user);
        String jwt = tokenUtil.generateToken(Long.valueOf(user.getUserId()));
        return jwt;
    }
}
