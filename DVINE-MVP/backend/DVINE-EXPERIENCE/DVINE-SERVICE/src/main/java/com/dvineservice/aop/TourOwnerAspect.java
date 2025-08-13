package com.dvineservice.aop;

import com.dvinedao.domain.PermissionLevel;
import com.dvinedao.domain.Tour;
import com.dvinedao.mapper.TourMapper;
import com.dvinedao.mapper.UserMapper;
import com.dvineservice.exception.NotFoundException;
import com.dvineservice.exception.PermissionDeniedException;
import com.dvineservice.util.UserUtil;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Order(20) // Ensure this aspect runs after AdminCheckAspect
@Aspect
@Component
public class TourOwnerAspect {
    @Autowired
    private TourMapper tourMapper;
    @Autowired
    private UserMapper userMapper;

    /** runs *before* any method annotated with @TourOwnerCheck */
    @Before("@annotation(com.dvinedao.annotation.TourOwnerCheck)")
    public void verifyTourOwner(JoinPoint jp) {
        MethodSignature signature = (MethodSignature) jp.getSignature();
        String[] parameterNames = signature.getParameterNames();
        Object[] args = jp.getArgs();

        Long tourId = extractTourId(args, parameterNames);
        if (tourId == null) {
            throw new IllegalStateException(
                    "@TourOwnerCheck target must supply a tourId");
        }

        Tour existing = tourMapper.findById(tourId);
        // If the tour does not exist, throw NotFoundException
        if (existing == null) {
            throw new NotFoundException("Tour not found");
        }

        Long currentUser = UserUtil.getCurrentUserId();
        int perm = userMapper.findPermissionById(currentUser);

        // Business Rule: Only Managers (4) and Owners (5) can modify any tour
        // Everyone else (Regular, Premium, Partner_Unpaid, Partner) can only modify their own tours
        
        boolean isManagerOrOwner = (perm >= PermissionLevel.MANAGER);
        boolean isOwnerOfTour = existing.getCreatedBy().equals(currentUser);
        
        if (!isManagerOrOwner && !isOwnerOfTour) {
            if (PermissionLevel.isAnyPartner(perm)) {
                throw new PermissionDeniedException(
                        "Partner can only modify the tour created by themselves");
            } else {
                throw new PermissionDeniedException(
                        "You can only modify tours you created");
            }
        }
        /* nothing else — returning void continues execution */
    }

    /**
     * Try to locate a tour-id inside the arguments of the intercepted method.
     * Supported shapes:
     *   • Long with parameter name "tourId"    → returns the value
     *   • Tour entity                          → returns entity.getTourId()
     *
     * @return the id or {@code null} if none of the parameters contains it
     */
    private Long extractTourId(Object[] args, String[] paramNames) {
        if (args == null) {
            return null;
        }

        for (int i = 0; i < args.length && i < paramNames.length; i++) {
            Object arg = args[i];
            String paramName = paramNames[i];

            // 1) direct Long id with specific parameter name
            if (arg instanceof Long tourId && "tourId".equals(paramName)) {
                return tourId;
            }

            // 2) Tour entity
            if (arg instanceof Tour tour) {
                if (tour.getTourId() != null) {
                    return tour.getTourId();
                }
            }
        }

        return null;        // not found ➞ caller will throw IllegalStateException
    }
}