package com.dvineservice.filter;

import com.dvineservice.exception.InvalidTokenException;
import com.dvineservice.exception.MissingTokenException;
import com.dvineservice.util.TokenUtil;
import com.dvineservice.util.UserUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.List;

@Slf4j
@Component
public class JwtInterceptor implements HandlerInterceptor {
    @Autowired
    private TokenUtil tokenUtil;

    private static final AntPathMatcher PATH = new AntPathMatcher();

    /** URLs that never need JWT */
    private static final List<String> GET_WHITELIST = List.of(
            "/catalogues/**",    // /catalogues/list  |  /catalogues/123
            "/tours/**"          // /tours?catalogueId=3  |  /tours/101
    );

    /** URLs that skip JWT for all verbs (login, register, refresh…) */
    private static final List<String> ANY_METHOD_WHITELIST = List.of(
            "/auth/login",
            "/auth/register",
            "/auth/refresh",
            // OpenAPI/Swagger endpoints
            "/swagger-ui.html",
            "/swagger-ui/**",
            "/v3/api-docs/**",
            "/OpenAPI.yaml"
    );

    @Override
    public boolean preHandle(HttpServletRequest req,
                             HttpServletResponse res,
                             Object handler) throws Exception {

        String uri = req.getRequestURI();
        String method = req.getMethod();

        boolean allowedGet = "GET".equals(method) &&
                GET_WHITELIST.stream().anyMatch(p -> PATH.match(p, uri));

        boolean allowedAny = ANY_METHOD_WHITELIST.stream().anyMatch(p -> PATH.match(p, uri));

        if (allowedGet || allowedAny) {
            return true;                     // skip JWT, continue to controller
        }

        // --- let every pre-flight straight through ---
        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            res.setStatus(HttpServletResponse.SC_OK);   // CORS framework adds headers
            return true;
        }

        String token = req.getHeader("Authorization");

        // if the token is prefixed with "Bearer ", extract it
        // otherwise, just keep the token as is
        token = tokenUtil.extractBearerToken(token);

        // Handle the case where the token is not present
        if (!StringUtils.hasText(token)) {
            throw new MissingTokenException("User not logged in");
        }

        // Extract user ID from the token
        Long userId = tokenUtil.getUserIdFromToken(token);
        if (userId == null) {
            throw new InvalidTokenException("Token is invalid or expired");
        }
        UserUtil.setCurrentUserId(userId);
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest req, HttpServletResponse res,
                                Object handler, Exception ex) {
        UserUtil.clear();                  // make sure to clean even after exception
    }

}
