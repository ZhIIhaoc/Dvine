package com.dvineapi.controller;

import com.dvinedao.domain.User;
import com.dvinedao.domain.UserQueryParam;
import com.dvineservice.exception.GlobalExceptionHandler;
import com.dvineservice.service.UserService;
import com.dvineservice.util.UserUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.mockStatic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class UserControllerTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private MockMvc buildMockMvc() {
        // 手动初始化 @Mock/@InjectMocks
        MockitoAnnotations.openMocks(this);
        // standaloneSetup + 全局异常处理
        return MockMvcBuilders
                .standaloneSetup(userController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void getUserProfile_success_shouldReturn200WithUserQueryParam() throws Exception {
        MockMvc mockMvc = buildMockMvc();
        try (MockedStatic<UserUtil> u = mockStatic(UserUtil.class)) {
            u.when(UserUtil::getCurrentUserId).thenReturn(1L);

            UserQueryParam p = new UserQueryParam();
            p.setUserId(1L);
            p.setEmail("user@x.com");
            when(userService.getUserProfileById(1L)).thenReturn(p);

            mockMvc.perform(get("/users/profile"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(0))
                    .andExpect(jsonPath("$.msg").value("success"))
                    .andExpect(jsonPath("$.data.userId").value(1))
                    .andExpect(jsonPath("$.data.email").value("user@x.com"));
        }
    }

    @Test
    void updateUserProfile_success_shouldReturn200() throws Exception {
        MockMvc mockMvc = buildMockMvc();
        doNothing().when(userService).updateUserProfile(any(User.class));

        String body = objectMapper.writeValueAsString(new User() {{
            setEmail("user@x.com");
        }});

        mockMvc.perform(put("/users/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));
    }

    @Test
    void updateUserProfile_conflict_shouldReturn409() throws Exception {
        MockMvc mockMvc = buildMockMvc();
        doThrow(new DuplicateKeyException("for key 'users.email'"))
                .when(userService).updateUserProfile(any(User.class));

        String body = objectMapper.writeValueAsString(new User() {{
            setEmail("dup@x.com");
        }});

        mockMvc.perform(put("/users/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("The email already exists"));
    }

    @Test
    void updateUserProfile_badRequest_shouldReturn400() throws Exception {
        MockMvc mockMvc = buildMockMvc();
        doThrow(new IllegalArgumentException("You should patch at least one field"))
                .when(userService).updateUserProfile(any(User.class));

        String body = objectMapper.writeValueAsString(new User());

        mockMvc.perform(put("/users/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("You should patch at least one field"));
    }
}