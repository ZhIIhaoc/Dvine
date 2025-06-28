package com.dvineservice.util;

import com.dvinedao.domain.TokenResponse;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Component
public class TokenUtil {
    private static final Logger log = LoggerFactory.getLogger(TokenUtil.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.access-token-expiration}")
    private Long accessTokenExpiration;

    @Value("${jwt.refresh-token-expiration}")
    private Long refreshTokenExpiration;

    private static final String REFRESH_TOKEN_PREFIX = "refresh_token";

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    public String generateToken(Long userId) {

        return Jwts.builder()
                .claim("userId", userId)
                .claim("type", "access")
                .setSubject(String.valueOf(userId))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
                .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(Long userId) {
        log.info("Starting to generate refresh token for userId: {}", userId);
        String refreshToken = Jwts.builder()
                .claim("userId", userId)
                .claim("type", "refresh")
                .setSubject(String.valueOf(userId))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()), SignatureAlgorithm.HS256)
                .compact();
        
        log.info("Refresh token JWT created, now storing in Redis");
        try {
            stringRedisTemplate.opsForValue().set(REFRESH_TOKEN_PREFIX + userId, refreshToken, refreshTokenExpiration, TimeUnit.MILLISECONDS);
            log.info("Refresh token stored in Redis successfully");
        } catch (Exception e) {
            log.error("Failed to store refresh token in Redis: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to store refresh token", e);
        }
        return refreshToken;
    }

    // Verify the access token
    public boolean verifyToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(jwtSecret.getBytes()))
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.error("JWT token expired: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Invalid JWT token: {}", e.getMessage());
        }
        return false;
    }

    // Verify the refresh token
    public boolean verifyRefreshToken(String refreshToken, Long userId) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(jwtSecret.getBytes()))
                    .build()
                    .parseClaimsJws(refreshToken)
                    .getBody();

            // Check if it's a refresh token
            if(!claims.get("type").equals(("refresh"))) {
                log.error("Invalid refresh token type");
                return false;
            }

            // Verify the refresh token against Redis
            String redisKey = REFRESH_TOKEN_PREFIX + userId;
            String storedToken = stringRedisTemplate.opsForValue().get(redisKey);

            return refreshToken.equals(storedToken);
        } catch (ExpiredJwtException e) {
            log.error("Refresh token expired: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Invalid refresh token: {}", e.getMessage());
        }
        return false;
    }

    // Get user ID from the token
    public Long getUserIdFromToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(jwtSecret.getBytes()))
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return Long.valueOf(claims.getSubject());
        } catch (Exception e) {
            log.error("Failed to extract user ID from token: {}", e.getMessage());
            return null;
        }
    }

    // Renew the access token
    public String renewAccessToken(String refreshToken, Long userId) {
        if (!verifyRefreshToken(refreshToken, userId)) {
            log.error("Invalid refresh token for user ID: {}", userId);
            throw new IllegalArgumentException("Invalid refresh token");
        }
        return generateToken(userId);
    }

    public TokenResponse generateDoubleToken(Long userId) {
        Map<String, String> tokens = new HashMap<>();
        String accessToken = generateToken(userId);
        String refreshToken = generateRefreshToken(userId);
        tokens.put("accessToken", accessToken);
        tokens.put("refreshToken", refreshToken);

        return new TokenResponse(
                tokens.get("accessToken"),
                tokens.get("refreshToken")
        );
    }
}
