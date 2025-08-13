package com.dvineservice.service.impl;

import com.dvinedao.domain.PermissionLevel;
import com.dvinedao.domain.User;
import com.dvinedao.domain.UserQueryParam;
import com.dvinedao.mapper.UserMapper;
import com.dvineservice.exception.NotFoundException;
import com.dvineservice.exception.PermissionDeniedException;
import com.dvineservice.service.UserService;
import com.dvineservice.util.UserUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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
        // Security: Prevent password updates through profile update
        user.setPassword(null);
        user.setUserId(UserUtil.getCurrentUserId());
        userMapper.updateUser(user);
    }

    @Override
    public List<User> getUserList() {
        return userMapper.getUserList();
    }

    @Override
    public void updateUserPermission(Long userId, Integer newPermission) {
        if (userId == null || newPermission == null) {
            throw new IllegalArgumentException("User ID and permission cannot be null");
        }

        if (!PermissionLevel.isValidToUpdate(newPermission)) {
            throw new IllegalArgumentException("Invalid permission level");
        }

        Long currentUserId = UserUtil.getCurrentUserId();
        Integer currentUserPermission = userMapper.findPermissionById(currentUserId);
        Integer targetUserPermission = userMapper.findPermissionById(userId);
        
        if (targetUserPermission == null) {
            throw new NotFoundException("Target user not found");
        }

        validatePermissionChange(currentUserPermission, targetUserPermission, newPermission);
        
        userMapper.updateUserPermission(userId, newPermission);
    }

    private void validatePermissionChange(Integer currentUserPermission, Integer targetUserPermission, Integer newPermission) {
        if (PermissionLevel.isOwner(currentUserPermission)) {
            if (PermissionLevel.isOwner(newPermission)) {
                throw new PermissionDeniedException("Cannot upgrade users to Owner level");
            }
            return;
        }
        
        if (PermissionLevel.isManager(currentUserPermission)) {
            if (targetUserPermission >= PermissionLevel.PARTNER || newPermission >= PermissionLevel.PARTNER) {
                throw new PermissionDeniedException("Managers can only modify member-level permissions (Regular/Premium)");
            }
            return;
        }
        
        throw new PermissionDeniedException("Insufficient permissions to modify user permissions");
    }
}
