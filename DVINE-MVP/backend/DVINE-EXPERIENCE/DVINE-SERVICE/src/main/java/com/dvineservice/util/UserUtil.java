package com.dvineservice.util;

import com.dvinedao.domain.PermissionLevel;
import com.dvinedao.domain.User;
import com.dvinedao.domain.UserQueryParam;
import com.dvinedao.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class UserUtil {
    private static final ThreadLocal<Long> currentUserId = new ThreadLocal<>();

    @Autowired
    public void setUserMapper(UserMapper userMapper) {
        UserUtil.userMapper = userMapper;
    }

    private static UserMapper userMapper;

    public static void setCurrentUserId(Long userId) {
        currentUserId.set(userId);
    }

    public static Long getCurrentUserId() {
        return currentUserId.get();
    }

    public static void clear() {
        currentUserId.remove();
    }
    
    /**
     * Get current user - supports both authenticated users and guests
     * @return User object with permission level, or Guest user if not authenticated
     */
    public static User getCurrentUser() {
        Long userId = getCurrentUserId();
        
        // Guest user - not authenticated
        if (userId == null) {
            User guestUser = new User();
            guestUser.setUserId(null);
            guestUser.setPermission(PermissionLevel.GUEST);
            return guestUser;
        }
        
        // Authenticated user - fetch from database to get permission level
        UserQueryParam userQueryResult = userMapper.findUserById(userId);
        if (userQueryResult == null) {
            // User not found in database, treat as guest
            User guestUser = new User();
            guestUser.setUserId(null);
            guestUser.setPermission(PermissionLevel.GUEST);
            return guestUser;
        }
        
        // Convert UserQueryParam to User
        User user = new User();
        user.setUserId(userQueryResult.getUserId());
        user.setPermission(userQueryResult.getPermission());
        
        return user;
    }
}
