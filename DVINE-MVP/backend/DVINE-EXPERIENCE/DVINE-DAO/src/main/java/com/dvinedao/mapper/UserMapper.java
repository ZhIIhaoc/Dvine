package com.dvinedao.mapper;

import com.dvinedao.domain.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;

@Mapper
public interface UserMapper {
//    @Options(useGeneratedKeys = true, keyProperty = "userId")
    void insertUser(User user);
}
