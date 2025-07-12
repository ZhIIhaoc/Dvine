package com.dvineapi.controller;
import com.dvineservice.exception.LoginCredentialIncorrectException;
import com.dvinedao.domain.TokenResponse;
import com.dvinedao.domain.User;
import com.dvinedao.domain.ReturnResult;
import com.dvineservice.service.AuthService;
import com.dvineservice.util.UserUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import com.dvineservice.exception.InvalidTokenException;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.mockito.Mockito.mockStatic;
import org.mockito.MockedStatic;
@ExtendWith(MockitoExtension.class)
public class AuthControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    @Test
    void register_success_shouldReturn201WithToken() throws Exception {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
        TokenResponse tokenResponse = new TokenResponse("jwt-token-123", "jwt-refresh-abc");
        when(authService.register(any(User.class))).thenReturn(tokenResponse);

        User req = new User();
        req.setEmail("new@x.com");
        req.setPassword("pw123");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data.accessToken").value("jwt-token-123"))
                .andExpect(jsonPath("$.data.refreshToken").value("jwt-refresh-abc"));
    }
    @Test
    void register_duplicateEmail_shouldReturn409() throws Exception {
        mockMvc = MockMvcBuilders
                .standaloneSetup(authController)
                .setControllerAdvice(new com.dvineservice.exception.GlobalExceptionHandler())
                .build();

        when(authService.register(any()))
                .thenThrow(new DuplicateKeyException(
                        "Duplicate entry 'dup@x.com' for key 'users.email'"
                ));

        User req = new User();
        req.setEmail("dup@x.com");
        req.setPassword("pw123");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("The email already exists"));
    }

    @Test
    void login_success_shouldReturn200WithToken() throws Exception {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
        TokenResponse tokenResponse = new TokenResponse("jwt-login-456", "jwt-refresh-456");
        when(authService.login(any(User.class))).thenReturn(tokenResponse);

        User req = new User();
        req.setEmail("user@x.com");
        req.setPassword("pw456");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data.accessToken").value("jwt-login-456"))
                .andExpect(jsonPath("$.data.refreshToken").value("jwt-refresh-456"));
    }


    @Test
    void login_invalidCredentials_shouldReturn401WithError() throws Exception {
        mockMvc = MockMvcBuilders
                .standaloneSetup(authController)
                .setControllerAdvice(new com.dvineservice.exception.GlobalExceptionHandler())
                .build();

        when(authService.login(any(User.class)))
                .thenThrow(new LoginCredentialIncorrectException("Invalid email or password"));

        User req = new User();
        req.setEmail("user@x.com");
        req.setPassword("wrong-pw");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Invalid email or password"));
    }
    @Test
    void logout_success_shouldReturn200WithSuccessMsg() throws Exception {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
        try (MockedStatic<UserUtil> mockedUserUtil = mockStatic(UserUtil.class)) {
            mockedUserUtil.when(UserUtil::getCurrentUserId).thenReturn(123L);
            mockMvc.perform(post("/auth/logout"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(0))
                    .andExpect(jsonPath("$.msg").value("success"));
        }
    }
    @Test
    void refreshToken_success_shouldReturn200WithTokens() throws Exception {
        TokenResponse mockTokens = new TokenResponse("access-token-xxx", "refresh-token-yyy");
        when(authService.refreshToken(any())).thenReturn(mockTokens);

        String jsonBody = """
    {
        "refreshToken": "valid.refresh.token"
    }
    """;

        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();

        mockMvc.perform(post("/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data.accessToken").value("access-token-xxx"))
                .andExpect(jsonPath("$.data.refreshToken").value("refresh-token-yyy"));
    }

    @Test
    void refreshToken_invalid_shouldReturn401() throws Exception {
        when(authService.refreshToken(any()))
                .thenThrow(new InvalidTokenException("Token is invalid or expired"));

        String jsonBody = """
    {
        "refreshToken": "invalid.token"
    }
    """;

        mockMvc = MockMvcBuilders
                .standaloneSetup(authController)
                .setControllerAdvice(new com.dvineservice.exception.GlobalExceptionHandler())
                .build();

        mockMvc.perform(post("/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonBody))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Token is invalid or expired"));
    }
    @Test
    void refreshToken_missingToken_shouldReturn400() throws Exception {
        when(authService.refreshToken(any()))
                .thenThrow(new IllegalArgumentException("Refresh token and user ID are required"));

        String jsonBody = """
    {
        "refreshToken": ""
    }
    """;

        mockMvc = MockMvcBuilders
                .standaloneSetup(authController)
                .setControllerAdvice(new com.dvineservice.exception.GlobalExceptionHandler())
                .build();

        mockMvc.perform(post("/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Refresh token and user ID are required"));
    }



}
