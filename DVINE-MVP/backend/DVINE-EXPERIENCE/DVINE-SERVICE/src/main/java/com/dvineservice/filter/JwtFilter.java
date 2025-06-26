package com.dvineservice.filter;

import com.dvinedao.domain.ReturnResult;
import com.dvineservice.util.TokenUtil;
import com.dvineservice.util.UserUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter implements Filter {
    @Autowired
    private TokenUtil tokenUtil;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Logger log = LoggerFactory.getLogger(JwtFilter.class);

    // List of URLs to exclude from JWT validation
    private final List<String> excludeUrls = List.of(
            "/auth"
    );

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;
        String requestURI = request.getRequestURI();

        try{
            if(excludeUrls.stream().anyMatch(requestURI::startsWith)) {
                filterChain.doFilter(servletRequest, servletResponse);
                return;
            }

            // Extract the JWT token from header
            String token = request.getHeader("Authorization");

            // Handle the case where the token is not present
            if(!StringUtils.hasText(token)) {
                sendUnauthorizedResponse(response, "User not logged in");
                return;
            }

            Long userId = tokenUtil.getUserIdFromToken(token);
            if(userId == null) {
                sendUnauthorizedResponse(response, "Token is invalid or expired");
                return;
            }

            // Set the user ID in the UserUtil for further processing
            UserUtil.setCurrentUserId(userId);

            filterChain.doFilter(request, response);
        } catch (Exception e) {
            log.error("JWT filter error: {}", e.getMessage());
            sendUnauthorizedResponse(response, "Unauthorized access");
        } finally {
            UserUtil.clear();
        }
    }

    public void sendUnauthorizedResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(401);
        response.setContentType("application/json");
        String jsonResponse = objectMapper.writeValueAsString(ReturnResult.error(message));
        response.getWriter().write(jsonResponse);
    }
}
