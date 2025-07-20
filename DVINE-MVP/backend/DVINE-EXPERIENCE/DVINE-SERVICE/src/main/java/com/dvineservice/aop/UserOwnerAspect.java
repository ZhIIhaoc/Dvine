package com.dvineservice.aop;

import com.dvinedao.domain.PermissionLevel;
import com.dvinedao.domain.User;
import com.dvineservice.exception.PermissionDeniedException;
import com.dvineservice.util.UserUtil;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Order(25) // Run after PermissionCheckAspect but before other specific checks
@Aspect
@Component
@Slf4j
public class UserOwnerAspect {

    /** runs *before* any method annotated with @UserOwnerCheck */
    @Before("@annotation(com.dvinedao.annotation.UserOwnerCheck)")
    public void verifyUserOwnership(JoinPoint jp) {
        MethodSignature signature = (MethodSignature) jp.getSignature();
        String[] parameterNames = signature.getParameterNames();
        Object[] args = jp.getArgs();

        Long targetUserId = extractUserId(args, parameterNames);
        if (targetUserId == null) {
            throw new IllegalStateException(
                    "@UserOwnerCheck target must supply a userId parameter");
        }

        // Get current user
        User currentUser = UserUtil.getCurrentUser();
        
        // Apply user ownership logic:
        // Users can only access their own data OR have Partner+ permission
        if (!Objects.equals(targetUserId, currentUser.getUserId()) && 
            currentUser.getPermission() < PermissionLevel.PARTNER) {
            throw new PermissionDeniedException("You can only view your own bookings");
        }
        
        log.debug("User ownership validated for targetUserId: {} by user: {}", 
                  targetUserId, currentUser.getUserId());
    }

    /**
     * Try to locate a user-id inside the arguments of the intercepted method.
     * Supported shapes:
     *   • Long with parameter name "userId"    → returns the value
     *
     * @return the id or {@code null} if none of the parameters contains it
     */
    private Long extractUserId(Object[] args, String[] paramNames) {
        if (args == null) {
            return null;
        }

        for (int i = 0; i < args.length && i < paramNames.length; i++) {
            Object arg = args[i];
            String paramName = paramNames[i];

            // Direct Long id with specific parameter name
            if (arg instanceof Long userId && "userId".equals(paramName)) {
                return userId;
            }
        }

        return null;        // not found ➞ caller will throw IllegalStateException
    }
}