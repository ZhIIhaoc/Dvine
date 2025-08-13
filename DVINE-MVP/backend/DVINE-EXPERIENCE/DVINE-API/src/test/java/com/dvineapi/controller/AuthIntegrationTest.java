package com.dvineapi.controller;

import com.dvinedao.domain.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional // Ensure each test method is automatically rolled back after completion to keep tables clean
public class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void logout_shouldReturn401_whenNoToken() throws Exception {
        mockMvc.perform(post("/auth/logout"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }
    

    @Test
    public void register_emptyEmail_shouldReturn400() throws Exception {
        User invalidUser = new User();
        invalidUser.setEmail(""); // Empty email
        invalidUser.setPhone("+61412345678");
        invalidUser.setPassword("password123");
        invalidUser.setPostcode("2000");
        invalidUser.setFirstName("John");
        invalidUser.setLastName("Doe");
        
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidUser)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Registration fields cannot be empty or contain only spaces"));
    }
    
    @Test
    public void register_whitespaceOnlyEmail_shouldReturn400() throws Exception {
        User invalidUser = new User();
        invalidUser.setEmail("   "); // Whitespace-only email
        invalidUser.setPhone("+61412345678");
        invalidUser.setPassword("password123");
        invalidUser.setPostcode("2000");
        invalidUser.setFirstName("John");
        invalidUser.setLastName("Doe");
        
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidUser)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Registration fields cannot be empty or contain only spaces"));
    }
    

    @Test
    public void register_emptyPassword_shouldReturn400() throws Exception {
        User invalidUser = new User();
        invalidUser.setEmail("test@example.com");
        invalidUser.setPhone("+61412345678");
        invalidUser.setPassword(""); // Empty password
        invalidUser.setPostcode("2000");
        invalidUser.setFirstName("John");
        invalidUser.setLastName("Doe");
        
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidUser)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Registration fields cannot be empty or contain only spaces"));
    }
    

    
    @Test
    public void register_emptyFirstName_shouldReturn400() throws Exception {
        User invalidUser = new User();
        invalidUser.setEmail("test@example.com");
        invalidUser.setPhone("+61412345678");
        invalidUser.setPassword("password123");
        invalidUser.setPostcode("2000");
        invalidUser.setFirstName(""); // Empty firstName
        invalidUser.setLastName("Doe");
        
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidUser)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Registration fields cannot be empty or contain only spaces"));
    }
    
    @Test
    public void register_emptyLastName_shouldReturn400() throws Exception {
        User invalidUser = new User();
        invalidUser.setEmail("test@example.com");
        invalidUser.setPhone("+61412345678");
        invalidUser.setPassword("password123");
        invalidUser.setPostcode("2000");
        invalidUser.setFirstName("John");
        invalidUser.setLastName(""); // Empty lastName
        
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidUser)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Registration fields cannot be empty or contain only spaces"));
    }
    
    @Test
    public void register_multipleEmptyFields_shouldReturn400() throws Exception {
        User invalidUser = new User();
        invalidUser.setEmail(""); // Empty email
        invalidUser.setPhone(""); // Empty phone
        invalidUser.setPassword("password123");
        invalidUser.setPostcode("2000");
        invalidUser.setFirstName("John");
        invalidUser.setLastName("Doe");
        
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidUser)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Registration fields cannot be empty or contain only spaces"));
    }
    
    @Test
    public void register_whitespaceOnlyFields_shouldReturn400() throws Exception {
        User invalidUser = new User();
        invalidUser.setEmail("  "); // Whitespace-only email
        invalidUser.setPhone("   "); // Whitespace-only phone
        invalidUser.setPassword("    "); // Whitespace-only password
        invalidUser.setPostcode("2000");
        invalidUser.setFirstName("John");
        invalidUser.setLastName("Doe");
        
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidUser)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Registration fields cannot be empty or contain only spaces"));
    }
    
    // Test POST /auth/register - 409 Conflict case (email already exists)
    @Test
    public void register_emailAlreadyExists_shouldReturn409() throws Exception {
        User duplicateUser = new User();
        duplicateUser.setEmail("i_am_owner@example.com"); // Email that already exists in the test database
        duplicateUser.setPhone("+61412345678");
        duplicateUser.setPassword("password123");
        duplicateUser.setPostcode("2000");
        duplicateUser.setFirstName("John");
        duplicateUser.setLastName("Doe");
        
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateUser)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("The email already exists"));
    }
}
