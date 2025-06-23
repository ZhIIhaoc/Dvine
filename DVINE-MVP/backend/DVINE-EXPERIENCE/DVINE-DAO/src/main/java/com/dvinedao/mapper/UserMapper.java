package com.dvinedao.mapper;

import com.dvinedao.domain.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper {
    void insertUser(User user);
}
