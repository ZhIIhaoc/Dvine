package com.dvineservice.aop;

import com.dvinedao.domain.Catalogue;
import com.dvinedao.domain.PermissionLevel;
import com.dvinedao.domain.Tour;
import com.dvinedao.mapper.CatalogueMapper;
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
public class CatalogueOwnerAspect {
    @Autowired
    private CatalogueMapper catalogueMapper;
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private TourMapper tourMapper;

    /** runs *before* any method annotated with @CatalogueOwnerCheck */
    @Before("@annotation(com.dvinedao.annotation.CatalogueOwnerCheck)")
    public void verifyOwner(JoinPoint jp) {
        MethodSignature signature = (MethodSignature) jp.getSignature();
        String[] parameterNames = signature.getParameterNames();
        Object[] args = jp.getArgs();

        Long catalogueId = extractCatalogueId(args, parameterNames);
        if (catalogueId == null) {
            throw new IllegalStateException(
                    "@CatalogueOwnerCheck target must supply a catalogueId");
        }

        Catalogue existing = catalogueMapper.findCatalogueById(catalogueId);
        // If the catalogue does not exist, throw NotFoundException
        if (existing == null) {
            throw new NotFoundException("Catalogue not found");
        }

        Long currentUser = UserUtil.getCurrentUserId();
        int perm = userMapper.findPermissionById(currentUser);

        // Check if the current user is the creator of the catalogue
//        if (PermissionLevel.isPartner(perm) &&
//                !existing.getCreatorId().equals(currentUser)) {
//            throw new PermissionDeniedException(
//                    "Partner can only modify catalogues created by themselves");
//        }
        /* nothing else — returning void continues execution */
    }

    /**
     * Try to locate a catalogue-id inside the arguments of the intercepted method.
     * Supported shapes:
     *   • Long                      → returns the value
     *   • Catalogue                 → returns entity.getCatalogueId()
     *   • Tour                      → returns entity.getCatalogueId()
     *
     * @return the id or {@code null} if none of the parameters contains it
     */
    private Long extractCatalogueId(Object[] args, String[] paramNames) {
        if (args == null) {
            return null;
        }

        for (int i = 0; i < args.length && i < paramNames.length; i++) {
            Object arg = args[i];
            String paramName = paramNames[i];

            // 1) direct Long id with specific parameter name
            if (arg instanceof Long catalogueId && "catalogueId".equals(paramName)) {
                return catalogueId;
            } else if (arg instanceof Long tourId && "tourId".equals(paramName)) {
                // also accept "id" as a parameter name
                Tour tour = tourMapper.findById(tourId);
                if (tour == null) {
                    throw new NotFoundException("Tour not found");
                }
                return tour.getCatalogueId();
            }

            // 2) Catalogue entity
            if (arg instanceof Catalogue catalogue) {
                if (catalogue.getCatalogueId() != null) {
                    return catalogue.getCatalogueId();
                }
            }

            // 3) Tour entity
            if (arg instanceof Tour tour) {
                if (tour.getCatalogueId() != null) {
                    return tour.getCatalogueId();
                }
            }

//            // 4) TourQueryParam entity
//            if (arg instanceof TourQueryParam tourQueryParam) {
//                if (tourQueryParam.getCatalogueId() != null) {
//                    return tourQueryParam.getCatalogueId();
//                }
//            }
        }

        return null;        // not found ➞ caller will throw IllegalStateException
    }

}
