package com.dvineservice.aop;

import com.dvinedao.domain.PermissionLevel;
import com.dvinedao.mapper.UserMapper;
import com.dvineservice.exception.PermissionDeniedException;
import com.dvineservice.util.UserUtil;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Aspect
@Slf4j
public class AdminCheckAspect {
    @Autowired
    private UserMapper userMapper;

    @Before("@annotation(com.dvinedao.annotation.AdminPermissionCheck)")
    public void checkAdmin() {
        log.info("Admin permission check: {}", UserUtil.getCurrentUserId());
        Long currentUserId = UserUtil.getCurrentUserId();
        Integer permission = userMapper.findPermissionById(currentUserId);
        if (!PermissionLevel.isAdmin(permission)) {
            throw new PermissionDeniedException("You do not have permission to create a catalogue");
        }
    }


}
