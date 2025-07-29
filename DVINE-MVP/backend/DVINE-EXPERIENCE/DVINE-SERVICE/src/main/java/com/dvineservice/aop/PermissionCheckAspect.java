package com.dvineservice.aop;

import com.dvinedao.annotation.PermissionCheck;
import com.dvinedao.domain.PermissionLevel;
import com.dvinedao.mapper.UserMapper;
import com.dvineservice.exception.PermissionDeniedException;
import com.dvineservice.util.UserUtil;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;


@Order(10) // Ensure this aspect runs before CatalogueOwnerAspect
@Component
@Aspect
@Slf4j
public class PermissionCheckAspect {
    @Autowired
    private UserMapper userMapper;

    /**
     * Aspect to check if the current user has admin permissions.
     * This method is triggered before any method annotated with @AdminPermissionCheck.
     */
    @Before("@annotation(permissionCheck)")
    public void checkAdmin(PermissionCheck permissionCheck) {
        log.info("Permission check: {}", UserUtil.getCurrentUserId());
        Long currentUserId = UserUtil.getCurrentUserId();
        Integer permission = userMapper.findPermissionById(currentUserId);
        Integer requiredLevel = permissionCheck.value();
        // Check if user has sufficient permission level (hierarchical check)
        if (permission == null || permission < requiredLevel) {
            String requiredLevelName = getPermissionLevelName(requiredLevel);
            throw new PermissionDeniedException("You don't have permission to access this resource. Required level: " + requiredLevelName);
        }

    }

    private String getPermissionLevelName(Integer level) {
        if (level.equals(PermissionLevel.OWNER)) return "Owner";
        if (level.equals(PermissionLevel.MANAGER)) return "Manager";
        if (level.equals(PermissionLevel.PARTNER)) return "Partner";
        if (level.equals(PermissionLevel.PARTNER_UNPAID)) return "Partner (Unpaid)";
        if (level.equals(PermissionLevel.PREMIUM)) return "Premium";
        if (level.equals(PermissionLevel.REGULAR)) return "Regular";
        return "Unknown";
    }


}
