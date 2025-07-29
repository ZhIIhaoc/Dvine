package com.dvineapi.controller;

import com.dvinedao.domain.User;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional // Ensure each test method is automatically rolled back after completion to keep tables clean
class UserIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    private String loginAndGetToken(String email) throws Exception {
        User loginUser = new User();
        loginUser.setEmail(email);
        loginUser.setPassword("1234"); // plain-text password

        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andReturn();

        String loginJson = loginResult.getResponse().getContentAsString();
        JsonNode dataNode = objectMapper.readTree(loginJson).path("data");
        return dataNode.get("accessToken").asText();
    }

    @Test
    void getUserProfile_shouldReturn401_whenNoToken() throws Exception {
        mockMvc.perform(get("/users/profile"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }

    @Test
    void updateUserProfile_shouldReturn401_whenNoToken() throws Exception {
        // 这里传一个空的 JSON body，Filter 会先拦截，不会走到 Controller/Service
        mockMvc.perform(put("/users/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }
    
    // Test PUT /users/permission - 400 Error cases (Bad Request)
    @Test
    public void updateUserPermission_missingUserId_shouldReturn400() throws Exception {
        String token = loginAndGetToken("i_am_manager@example.com");
        
        String requestBody = "{\"permission\": 1}"; // Missing userId
        
        mockMvc.perform(put("/users/permission")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User ID and permission cannot be null"));
    }
    
    @Test
    public void updateUserPermission_missingPermission_shouldReturn400() throws Exception {
        String token = loginAndGetToken("i_am_manager@example.com");
        
        String requestBody = "{\"userId\": 1}"; // Missing permission
        
        mockMvc.perform(put("/users/permission")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User ID and permission cannot be null"));
    }
    
    @Test
    public void updateUserPermission_invalidPermissionValue_shouldReturn400() throws Exception {
        String token = loginAndGetToken("i_am_manager@example.com");
        
        String requestBody = "{\"userId\": 1, \"permission\": 6}"; // Invalid permission value (>5)
        
        mockMvc.perform(put("/users/permission")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Invalid permission level"));
    }
    
    @Test
    public void updateUserPermission_negativePermissionValue_shouldReturn400() throws Exception {
        String token = loginAndGetToken("i_am_manager@example.com");
        
        String requestBody = "{\"userId\": 1, \"permission\": -1}"; // Invalid permission value (<0)
        
        mockMvc.perform(put("/users/permission")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Invalid permission level"));
    }
    
    // Test PUT /users/permission - 401 Error cases (Unauthorized)
    @Test
    public void updateUserPermission_noToken_shouldReturn401() throws Exception {
        String requestBody = "{\"userId\": 1, \"permission\": 1}";
        
        mockMvc.perform(put("/users/permission")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }
    
    // Test PUT /users/permission - 403 Error cases (Forbidden)
    @Test
    public void updateUserPermission_asRegularMember_shouldReturn403() throws Exception {
        String token = loginAndGetToken("i_am_regular@example.com");
        
        String requestBody = "{\"userId\": 1, \"permission\": 1}";
        
        mockMvc.perform(put("/users/permission")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("You don't have permission to access this resource. Required level: Manager"));
    }
    
    @Test
    public void updateUserPermission_asPremiumMember_shouldReturn403() throws Exception {
        String token = loginAndGetToken("i_am_premium@example.com");
        
        String requestBody = "{\"userId\": 1, \"permission\": 1}";
        
        mockMvc.perform(put("/users/permission")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("You don't have permission to access this resource. Required level: Manager"));
    }
    
    @Test
    public void updateUserPermission_asPartner_shouldReturn403() throws Exception {
        String token = loginAndGetToken("i_am_partner@example.com");
        
        String requestBody = "{\"userId\": 1, \"permission\": 1}";
        
        mockMvc.perform(put("/users/permission")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("You don't have permission to access this resource. Required level: Manager"));
    }
    
    @Test
    public void updateUserPermission_managerTryingToSetPartnerLevel_shouldReturn403() throws Exception {
        String token = loginAndGetToken("i_am_manager@example.com");
        
        String requestBody = "{\"userId\": 1, \"permission\": 3}"; // Partner level - Manager can't set this
        
        mockMvc.perform(put("/users/permission")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Managers can only modify member-level permissions (Regular/Premium)"));
    }
    
    @Test
    public void updateUserPermission_managerTryingToSetManagerLevel_shouldReturn403() throws Exception {
        String token = loginAndGetToken("i_am_manager@example.com");
        
        String requestBody = "{\"userId\": 1, \"permission\": 4}"; // Manager level - Manager can't set this
        
        mockMvc.perform(put("/users/permission")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Managers can only modify member-level permissions (Regular/Premium)"));
    }
    
    @Test
    public void updateUserPermission_tryingToSetOwnerLevel_shouldReturn403() throws Exception {
        String token = loginAndGetToken("i_am_owner@example.com");
        
        String requestBody = "{\"userId\": 1, \"permission\": 5}"; // Owner level - Cannot be assigned to others
        
        mockMvc.perform(put("/users/permission")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Cannot upgrade users to Owner level"));
    }
    

    

    
    // Test PUT /users/permission - 404 Error case (Not Found)
    @Test
    public void updateUserPermission_userNotFound_shouldReturn404() throws Exception {
        String token = loginAndGetToken("i_am_manager@example.com");
        
        String requestBody = "{\"userId\": 99999, \"permission\": 1}"; // Non-existent user ID
        
        mockMvc.perform(put("/users/permission")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Target user not found"));
    }
    
    // Test PUT /users/permission - 200 Success cases
    @Test
    public void updateUserPermission_managerSetRegularLevel_shouldReturn200() throws Exception {
        String token = loginAndGetToken("i_am_manager@example.com");
        
        String requestBody = "{\"userId\": 1, \"permission\": 0}"; // Regular level - Manager can set this
        
        mockMvc.perform(put("/users/permission")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));
    }
    
    @Test
    public void updateUserPermission_managerSetPremiumLevel_shouldReturn200() throws Exception {
        String token = loginAndGetToken("i_am_manager@example.com");
        
        String requestBody = "{\"userId\": 1, \"permission\": 1}"; // Premium level - Manager can set this
        
        mockMvc.perform(put("/users/permission")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));
    }
    
    @Test
    public void updateUserPermission_ownerSetPartnerLevel_shouldReturn200() throws Exception {
        String token = loginAndGetToken("i_am_owner@example.com");
        
        String requestBody = "{\"userId\": 1, \"permission\": 3}"; // Partner level - Owner can set this
        
        mockMvc.perform(put("/users/permission")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));
    }
    
    @Test
    public void updateUserPermission_ownerSetManagerLevel_shouldReturn200() throws Exception {
        String token = loginAndGetToken("i_am_owner@example.com");
        
        String requestBody = "{\"userId\": 1, \"permission\": 4}"; // Manager level - Owner can set this
        
        mockMvc.perform(put("/users/permission")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));
    }
}

