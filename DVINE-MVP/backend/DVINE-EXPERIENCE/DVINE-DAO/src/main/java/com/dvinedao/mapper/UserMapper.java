package com.dvinedao.mapper;

import com.dvinedao.domain.User;
import com.dvinedao.domain.UserQueryParam;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface UserMapper {
    void insertUser(User user);
    UserQueryParam findUserById(Long userId);
    void updateUser(User user);
    User selectUserByIdAndPwd(User user);
    User selectUserByEmail(String email);
    Integer findPermissionById(Long userId);
    List<User> getUserList();
}
