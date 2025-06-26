package com.dvinedao.mapper;

import com.dvinedao.domain.User;
import com.dvinedao.domain.UserQueryParam;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper {
//    @Options(useGeneratedKeys = true, keyProperty = "userId")
    void insertUser(User user);
    UserQueryParam findUserById(Long userId);
    void updateUser(User user);
}
