package com.dvineapi.controller;

import com.dvinedao.domain.Catalogue;
import com.dvinedao.domain.PendingTour;
import com.dvinedao.domain.Tour;
import com.dvinedao.domain.User;
import com.dvinedao.mapper.CatalogueMapper;
import com.dvinedao.mapper.PendingTourMapper;
import com.dvinedao.mapper.TourMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional // Ensure each test method is automatically rolled back after completion to keep tables clean
public class ApprovalControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PendingTourMapper pendingTourMapper;
    
    @Autowired
    private TourMapper tourMapper;
    
    @Autowired
    private CatalogueMapper catalogueMapper;

    @Autowired
    private ObjectMapper objectMapper;

    private Catalogue testCatalogue;
    private Tour testTour;
    private PendingTour testPendingTour;

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

    @BeforeEach
    public void setup() {
        // Create test catalogue
        Catalogue catalogue = new Catalogue();
        catalogue.setTitle("Test Catalogue for Approval");
        catalogue.setDescription("Test catalogue for approval testing");
        catalogue.setCoverImage("https://cdn/test-catalogue.jpg");
        catalogueMapper.createCatalogue(catalogue);
        this.testCatalogue = catalogue;

        // Create test tour
        Tour tour = new Tour();
        tour.setCatalogueId(catalogue.getCatalogueId());
        tour.setTitle("Test Tour for Approval");
        tour.setDestination("Test Destination");
        tour.setDescription("Test tour for approval testing");
        tour.setRegularPrice(new BigDecimal("199.99"));
        tour.setPremiumPrice(new BigDecimal("179.99"));
        tour.setPrimaryImageUrl("https://cdn/test-tour.jpg");
        tour.setCreatedBy(4L); // Partner user ID
        tourMapper.createTour(tour);
        this.testTour = tour;

        // Create test pending tour
        PendingTour pendingTour = new PendingTour();
        pendingTour.setOriginalTourId(tour.getTourId());
        pendingTour.setCatalogueId(catalogue.getCatalogueId());
        pendingTour.setTitle("Pending Tour for Testing");
        pendingTour.setDestination("Pending Destination");
        pendingTour.setDescription("Pending tour for testing");
        pendingTour.setRegularPrice(new BigDecimal("299.99"));
        pendingTour.setPremiumPrice(new BigDecimal("269.99"));
        pendingTour.setPrimaryImageUrl("https://cdn/pending-tour.jpg");
        pendingTour.setOperationType(PendingTour.OperationType.UPDATE);
        pendingTour.setSubmittedBy(4L); // Partner user ID
        pendingTour.setStatus(0); // PENDING status
        pendingTourMapper.createPendingTour(pendingTour);
        this.testPendingTour = pendingTour;
    }

    // Test GET /approvals/pending-tours - Success cases
    @Test
    public void getAllPendingTours_asManager_shouldReturn200() throws Exception {
        String token = loginAndGetToken("i_am_manager@example.com");

        mockMvc.perform(get("/approvals/pending-tours")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data", hasSize(1))) // Should have exactly 1 pending tour from setup
                // Verify the pending tour data
                .andExpect(jsonPath("$.data[0].pendingTourId").value(testPendingTour.getPendingTourId().intValue()))
                .andExpect(jsonPath("$.data[0].title").value("Pending Tour for Testing"))
                .andExpect(jsonPath("$.data[0].destination").value("Pending Destination"))
                .andExpect(jsonPath("$.data[0].description").value("Pending tour for testing"))
                .andExpect(jsonPath("$.data[0].regularPrice").value(299.99))
                .andExpect(jsonPath("$.data[0].premiumPrice").value(269.99))
                .andExpect(jsonPath("$.data[0].operationType").value("UPDATE"))
                .andExpect(jsonPath("$.data[0].submittedBy").value(4)) // Partner user ID
                .andExpect(jsonPath("$.data[0].status").value(0)) // PENDING status
                .andExpect(jsonPath("$.data[0].originalTourId").value(testTour.getTourId().intValue()));
    }

    @Test
    public void getAllPendingTours_asOwner_shouldReturn200() throws Exception {
        String token = loginAndGetToken("i_am_owner@example.com");

        mockMvc.perform(get("/approvals/pending-tours")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data").isArray());
    }

    // Test GET /approvals/pending-tours - Error cases
    @Test
    public void getAllPendingTours_unauthenticated_shouldReturn401() throws Exception {
        mockMvc.perform(get("/approvals/pending-tours")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }

    @Test
    public void getAllPendingTours_asPartner_shouldReturn403() throws Exception {
        String token = loginAndGetToken("i_am_partner@example.com");

        mockMvc.perform(get("/approvals/pending-tours")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").isString());
    }

    @Test
    public void getAllPendingTours_asPremiumMember_shouldReturn403() throws Exception {
        String token = loginAndGetToken("i_am_premium@example.com");

        mockMvc.perform(get("/approvals/pending-tours")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").isString());
    }

    // Test GET /approvals/tours/{pendingTourId} - Success cases
    @Test
    public void getPendingTourById_asManager_shouldReturn200() throws Exception {
        String token = loginAndGetToken("i_am_manager@example.com");

        mockMvc.perform(get("/approvals/tours/{pendingTourId}", testPendingTour.getPendingTourId())
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data.pendingTourId").value(testPendingTour.getPendingTourId().intValue()))
                .andExpect(jsonPath("$.data.title").value("Pending Tour for Testing"))
                .andExpect(jsonPath("$.data.destination").value("Pending Destination"))
                .andExpect(jsonPath("$.data.regularPrice").value(299.99))
                .andExpect(jsonPath("$.data.premiumPrice").value(269.99));
    }

    @Test
    public void getPendingTourById_asOwner_shouldReturn200() throws Exception {
        String token = loginAndGetToken("i_am_owner@example.com");

        mockMvc.perform(get("/approvals/tours/{pendingTourId}", testPendingTour.getPendingTourId())
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data.pendingTourId").value(testPendingTour.getPendingTourId().intValue()));
    }

    // Test GET /approvals/tours/{pendingTourId} - Error cases
    @Test
    public void getPendingTourById_unauthenticated_shouldReturn401() throws Exception {
        mockMvc.perform(get("/approvals/tours/{pendingTourId}", testPendingTour.getPendingTourId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }

    @Test
    public void getPendingTourById_asPartner_shouldReturn403() throws Exception {
        String token = loginAndGetToken("i_am_partner@example.com");

        mockMvc.perform(get("/approvals/tours/{pendingTourId}", testPendingTour.getPendingTourId())
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").isString());
    }

    @Test
    public void getPendingTourById_notFound_shouldReturn404() throws Exception {
        String token = loginAndGetToken("i_am_manager@example.com");

        mockMvc.perform(get("/approvals/tours/{pendingTourId}", 99999L)
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Pending tour not found"));
    }

    // Test POST /approvals/tours/{pendingTourId}/approve - Success cases
    @Test
    public void approvePendingTour_asManager_shouldReturn200() throws Exception {
        String token = loginAndGetToken("i_am_manager@example.com");

        mockMvc.perform(post("/approvals/tours/{pendingTourId}/approve", testPendingTour.getPendingTourId())
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));

        // Verify the pending tour status is updated to approved
        PendingTour updatedPendingTour = pendingTourMapper.findById(testPendingTour.getPendingTourId());
        assertThat(updatedPendingTour.getStatus()).isEqualTo(1); // APPROVED status
        assertThat(updatedPendingTour.getReviewedBy()).isEqualTo(5L); // Manager user ID
    }

    @Test
    public void approvePendingTour_asOwner_shouldReturn200() throws Exception {
        String token = loginAndGetToken("i_am_owner@example.com");

        mockMvc.perform(post("/approvals/tours/{pendingTourId}/approve", testPendingTour.getPendingTourId())
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));

        // Verify the pending tour status is updated to approved
        PendingTour updatedPendingTour = pendingTourMapper.findById(testPendingTour.getPendingTourId());
        assertThat(updatedPendingTour.getStatus()).isEqualTo(1); // APPROVED status
        assertThat(updatedPendingTour.getReviewedBy()).isEqualTo(6L); // Owner user ID
    }

    // Test POST /approvals/tours/{pendingTourId}/approve - Error cases
    @Test
    public void approvePendingTour_unauthenticated_shouldReturn401() throws Exception {
        mockMvc.perform(post("/approvals/tours/{pendingTourId}/approve", testPendingTour.getPendingTourId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }

    @Test
    public void approvePendingTour_asPartner_shouldReturn403() throws Exception {
        String token = loginAndGetToken("i_am_partner@example.com");

        mockMvc.perform(post("/approvals/tours/{pendingTourId}/approve", testPendingTour.getPendingTourId())
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").isString());
    }

    @Test
    public void approvePendingTour_notFound_shouldReturn404() throws Exception {
        String token = loginAndGetToken("i_am_manager@example.com");

        mockMvc.perform(post("/approvals/tours/{pendingTourId}/approve", 99999L)
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Pending tour not found"));
    }

    // Test POST /approvals/tours/{pendingTourId}/reject - Success cases
    @Test
    public void rejectPendingTour_asManager_shouldReturn200() throws Exception {
        String token = loginAndGetToken("i_am_manager@example.com");

        mockMvc.perform(post("/approvals/tours/{pendingTourId}/reject", testPendingTour.getPendingTourId())
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));

        // Verify the pending tour status is updated to rejected
        PendingTour updatedPendingTour = pendingTourMapper.findById(testPendingTour.getPendingTourId());
        assertThat(updatedPendingTour.getStatus()).isEqualTo(2); // REJECTED status
        assertThat(updatedPendingTour.getReviewedBy()).isEqualTo(5L); // Manager user ID
    }

    @Test
    public void rejectPendingTour_asOwner_shouldReturn200() throws Exception {
        String token = loginAndGetToken("i_am_owner@example.com");

        mockMvc.perform(post("/approvals/tours/{pendingTourId}/reject", testPendingTour.getPendingTourId())
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));

        // Verify the pending tour status is updated to rejected
        PendingTour updatedPendingTour = pendingTourMapper.findById(testPendingTour.getPendingTourId());
        assertThat(updatedPendingTour.getStatus()).isEqualTo(2); // REJECTED status
        assertThat(updatedPendingTour.getReviewedBy()).isEqualTo(6L); // Owner user ID
    }

    // Test POST /approvals/tours/{pendingTourId}/reject - Error cases
    @Test
    public void rejectPendingTour_unauthenticated_shouldReturn401() throws Exception {
        mockMvc.perform(post("/approvals/tours/{pendingTourId}/reject", testPendingTour.getPendingTourId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }

    @Test
    public void rejectPendingTour_asPartner_shouldReturn403() throws Exception {
        String token = loginAndGetToken("i_am_partner@example.com");

        mockMvc.perform(post("/approvals/tours/{pendingTourId}/reject", testPendingTour.getPendingTourId())
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").isString());
    }

    @Test
    public void rejectPendingTour_notFound_shouldReturn404() throws Exception {
        String token = loginAndGetToken("i_am_manager@example.com");

        mockMvc.perform(post("/approvals/tours/{pendingTourId}/reject", 99999L)
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Pending tour not found"));
    }

    // Test GET /approvals/history - Success cases
    @Test
    public void getApprovalHistory_asManager_shouldReturn200() throws Exception {
        String token = loginAndGetToken("i_am_manager@example.com");

        mockMvc.perform(get("/approvals/history")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    public void getApprovalHistory_asOwner_shouldReturn200() throws Exception {
        String token = loginAndGetToken("i_am_owner@example.com");

        mockMvc.perform(get("/approvals/history")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data").isArray());
    }

    // Test GET /approvals/history - Error cases
    @Test
    public void getApprovalHistory_unauthenticated_shouldReturn401() throws Exception {
        mockMvc.perform(get("/approvals/history")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }

    @Test
    public void getApprovalHistory_asPartner_shouldReturn403() throws Exception {
        String token = loginAndGetToken("i_am_partner@example.com");

        mockMvc.perform(get("/approvals/history")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").isString());
    }

    @Test
    public void getApprovalHistory_asPremiumMember_shouldReturn403() throws Exception {
        String token = loginAndGetToken("i_am_premium@example.com");

        mockMvc.perform(get("/approvals/history")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").isString());
    }

    // Test GET /approvals/my-submissions - Success cases
    @Test
    public void getMySubmissions_asPartner_shouldReturn200() throws Exception {
        String token = loginAndGetToken("i_am_partner@example.com");

        mockMvc.perform(get("/approvals/my-submissions")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data").isArray());
    }


    // Test GET /approvals/my-submissions - Error cases
    @Test
    public void getMySubmissions_unauthenticated_shouldReturn401() throws Exception {
        mockMvc.perform(get("/approvals/my-submissions")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }

    @Test
    public void getMySubmissions_asPremiumMember_shouldReturn403() throws Exception {
        String token = loginAndGetToken("i_am_premium@example.com");

        mockMvc.perform(get("/approvals/my-submissions")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").isString());
    }

    // Integration test - Complete approval workflow
    @Test
    public void completeApprovalWorkflow_shouldWork() throws Exception {
        String managerToken = loginAndGetToken("i_am_manager@example.com");
        String partnerToken = loginAndGetToken("i_am_partner@example.com");

        // 1. Partner checks their submissions
        mockMvc.perform(get("/approvals/my-submissions")
                        .header("Authorization", partnerToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));

        // 2. Manager gets all pending tours
        mockMvc.perform(get("/approvals/pending-tours")
                        .header("Authorization", managerToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));

        // 3. Manager gets specific pending tour details
        mockMvc.perform(get("/approvals/tours/{pendingTourId}", testPendingTour.getPendingTourId())
                        .header("Authorization", managerToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));

        // 4. Manager approves the pending tour
        mockMvc.perform(post("/approvals/tours/{pendingTourId}/approve", testPendingTour.getPendingTourId())
                        .header("Authorization", managerToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));

        // 5. Manager checks approval history
        mockMvc.perform(get("/approvals/history")
                        .header("Authorization", managerToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));

        // Verify the tour was approved
        PendingTour approvedTour = pendingTourMapper.findById(testPendingTour.getPendingTourId());
        assertThat(approvedTour.getStatus()).isEqualTo(1); // APPROVED status
        assertThat(approvedTour.getReviewedBy()).isEqualTo(5L); // Manager user ID
    }
}