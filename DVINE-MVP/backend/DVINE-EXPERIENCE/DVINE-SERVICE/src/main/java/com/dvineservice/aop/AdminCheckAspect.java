package com.dvineservice.aop;

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
public class AdminCheckAspect {
    @Autowired
    private UserMapper userMapper;

    /**
     * Aspect to check if the current user has admin permissions.
     * This method is triggered before any method annotated with @AdminPermissionCheck.
     */
    @Before("@annotation(com.dvinedao.annotation.AdminPermissionCheck)")
    public void checkAdmin() {
        log.info("Admin permission check: {}", UserUtil.getCurrentUserId());
        Long currentUserId = UserUtil.getCurrentUserId();
        Integer permission = userMapper.findPermissionById(currentUserId);
        if (!PermissionLevel.isAdmin(permission)) {
            throw new PermissionDeniedException("You don't have permission to modify this catalogue");
        }
    }


}
