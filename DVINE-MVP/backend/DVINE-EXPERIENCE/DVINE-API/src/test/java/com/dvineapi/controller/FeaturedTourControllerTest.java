package com.dvineapi.controller;

import com.dvinedao.domain.FeaturedTour;
import com.dvinedao.domain.Tour;
import com.dvinedao.domain.User;
import com.dvinedao.mapper.FeaturedTourMapper;
import com.dvinedao.mapper.TourMapper;
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

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class FeaturedTourControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private FeaturedTourMapper featuredTourMapper;

    @Autowired
    private TourMapper tourMapper;

    private String loginAndGetToken(String email) throws Exception {
        User loginUser = new User();
        loginUser.setEmail(email);
        loginUser.setPassword("1234");

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

    private Tour createTestTour() {
        Tour tour = new Tour();
        tour.setCatalogueId(1L);
        tour.setTitle("Test Featured Tour");
        tour.setDestination("Sydney, Australia");
        tour.setDescription("Amazing test tour");
        tour.setRegularPrice(BigDecimal.valueOf(299.99));
        tour.setPremiumPrice(BigDecimal.valueOf(269.99));
        tour.setCreatedBy(1L);
        tour.setPrimaryImageUrl("https://example.com/test.jpg");
        tourMapper.createTour(tour);
        return tour;
    }

    private FeaturedTour createFeaturedTour(Long tourId, Integer displayOrder) {
        FeaturedTour featuredTour = new FeaturedTour();
        featuredTour.setTourId(tourId);
        featuredTour.setDisplayOrder(displayOrder);
        featuredTourMapper.addFeaturedTour(featuredTour);
        return featuredTour;
    }

    // GET /featured-tours - Get featured tours for main page
    @Test
    void getFeaturedToursForMainPage_shouldReturn200() throws Exception {
        // Create test tours and add to featured
        Tour tour1 = createTestTour();
        Tour tour2 = createTestTour();
        tour2.setTitle("Second Featured Tour");
        tourMapper.updateTour(tour2);

        createFeaturedTour(tour1.getTourId(), 1);
        createFeaturedTour(tour2.getTourId(), 2);

        mockMvc.perform(get("/featured-tours"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data").isArray());
    }

    // POST /featured-tours - Add tour to featured list
    @Test
    void addFeaturedTour_asManager_shouldReturn201() throws Exception {
        Tour tour = createTestTour();
        String token = loginAndGetToken("i_am_manager@example.com");

        mockMvc.perform(post("/featured-tours")
                        .param("tourId", tour.getTourId().toString())
                        .header("Authorization", token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));
    }

    @Test
    void addFeaturedTour_tourNotFound_shouldReturn404() throws Exception {
        String token = loginAndGetToken("i_am_manager@example.com");

        mockMvc.perform(post("/featured-tours")
                        .param("tourId", "99999")
                        .header("Authorization", token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Tour not found"));
    }

    @Test
    void addFeaturedTour_alreadyFeatured_shouldReturn400() throws Exception {
        Tour tour = createTestTour();
        createFeaturedTour(tour.getTourId(), 1);
        String token = loginAndGetToken("i_am_manager@example.com");

        mockMvc.perform(post("/featured-tours")
                        .param("tourId", tour.getTourId().toString())
                        .header("Authorization", token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Tour is already featured"));
    }

    @Test
    void addFeaturedTour_unauthorized_shouldReturn401() throws Exception {
        Tour tour = createTestTour();

        mockMvc.perform(post("/featured-tours")
                        .param("tourId", tour.getTourId().toString()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }

    @Test
    void addFeaturedTour_asPartner_shouldReturn403() throws Exception {
        Tour tour = createTestTour();
        String token = loginAndGetToken("i_am_partner@example.com");

        mockMvc.perform(post("/featured-tours")
                        .param("tourId", tour.getTourId().toString())
                        .header("Authorization", token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("You don't have permission to access this resource. Required level: Manager"));
    }

    // DELETE /featured-tours - Remove tour from featured list
    @Test
    void removeFeaturedTour_asManager_shouldReturn200() throws Exception {
        Tour tour = createTestTour();
        createFeaturedTour(tour.getTourId(), 1);
        String token = loginAndGetToken("i_am_manager@example.com");

        mockMvc.perform(delete("/featured-tours")
                        .param("tourId", tour.getTourId().toString())
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));
    }

    @Test
    void removeFeaturedTour_notFeatured_shouldReturn400() throws Exception {
        Tour tour = createTestTour();
        String token = loginAndGetToken("i_am_manager@example.com");

        mockMvc.perform(delete("/featured-tours")
                        .param("tourId", tour.getTourId().toString())
                        .header("Authorization", token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Tour is not featured"));
    }

    @Test
    void removeFeaturedTour_unauthorized_shouldReturn401() throws Exception {
        Tour tour = createTestTour();
        createFeaturedTour(tour.getTourId(), 1);

        mockMvc.perform(delete("/featured-tours")
                        .param("tourId", tour.getTourId().toString()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }

    @Test
    void removeFeaturedTour_asPartner_shouldReturn403() throws Exception {
        Tour tour = createTestTour();
        createFeaturedTour(tour.getTourId(), 1);
        String token = loginAndGetToken("i_am_partner@example.com");

        mockMvc.perform(delete("/featured-tours")
                        .param("tourId", tour.getTourId().toString())
                        .header("Authorization", token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("You don't have permission to access this resource. Required level: Manager"));
    }

    // GET /featured-tours/manage - Get featured tours for management
    @Test
    void getAllFeaturedTours_asManager_shouldReturn200() throws Exception {
        Tour tour1 = createTestTour();
        Tour tour2 = createTestTour();
        tour2.setTitle("Second Tour");
        tourMapper.updateTour(tour2);

        createFeaturedTour(tour1.getTourId(), 1);
        createFeaturedTour(tour2.getTourId(), 2);

        String token = loginAndGetToken("i_am_manager@example.com");

        mockMvc.perform(get("/featured-tours/manage")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].featuredTourId").isNumber())
                .andExpect(jsonPath("$.data[0].tourId").isNumber())
                .andExpect(jsonPath("$.data[0].displayOrder").isNumber());
    }

    @Test
    void getAllFeaturedTours_unauthorized_shouldReturn401() throws Exception {
        mockMvc.perform(get("/featured-tours/manage"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }

    @Test
    void getAllFeaturedTours_asPartner_shouldReturn403() throws Exception {
        String token = loginAndGetToken("i_am_partner@example.com");

        mockMvc.perform(get("/featured-tours/manage")
                        .header("Authorization", token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("You don't have permission to access this resource. Required level: Manager"));
    }

    // PUT /featured-tours/reorder - Reorder featured tours
    @Test
    void reorderFeaturedTours_asManager_shouldReturn200() throws Exception {
        Tour tour1 = createTestTour();
        Tour tour2 = createTestTour();
        Tour tour3 = createTestTour();

        tour2.setTitle("Second Tour");
        tour3.setTitle("Third Tour");
        tourMapper.updateTour(tour2);
        tourMapper.updateTour(tour3);

        createFeaturedTour(tour1.getTourId(), 1);
        createFeaturedTour(tour2.getTourId(), 2);
        createFeaturedTour(tour3.getTourId(), 3);

        List<FeaturedTour> reorderList = new ArrayList<>();
        FeaturedTour ft1 = new FeaturedTour();
        ft1.setTourId(tour2.getTourId());
        ft1.setDisplayOrder(1);

        FeaturedTour ft2 = new FeaturedTour();
        ft2.setTourId(tour1.getTourId());
        ft2.setDisplayOrder(2);

        FeaturedTour ft3 = new FeaturedTour();
        ft3.setTourId(tour3.getTourId());
        ft3.setDisplayOrder(3);

        reorderList.add(ft1);
        reorderList.add(ft2);
        reorderList.add(ft3);

        String token = loginAndGetToken("i_am_manager@example.com");

        mockMvc.perform(put("/featured-tours/reorder")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reorderList)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));
    }

    @Test
    void reorderFeaturedTours_invalidOrder_shouldReturn400() throws Exception {
        Tour tour1 = createTestTour();
        Tour tour2 = createTestTour();

        createFeaturedTour(tour1.getTourId(), 1);
        createFeaturedTour(tour2.getTourId(), 2);

        List<FeaturedTour> reorderList = new ArrayList<>();
        FeaturedTour ft1 = new FeaturedTour();
        ft1.setTourId(tour1.getTourId());
        ft1.setDisplayOrder(1);

        FeaturedTour ft2 = new FeaturedTour();
        ft2.setTourId(tour2.getTourId());
        ft2.setDisplayOrder(3); // Invalid - should be 2

        reorderList.add(ft1);
        reorderList.add(ft2);

        String token = loginAndGetToken("i_am_manager@example.com");

        mockMvc.perform(put("/featured-tours/reorder")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reorderList)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Display orders must be consecutive starting from 1"));
    }

    @Test
    void reorderFeaturedTours_tourNotFeatured_shouldReturn400() throws Exception {
        Tour tour1 = createTestTour();
        Tour tour2 = createTestTour();

        createFeaturedTour(tour1.getTourId(), 1);
        // tour2 is not featured

        List<FeaturedTour> reorderList = new ArrayList<>();
        FeaturedTour ft1 = new FeaturedTour();
        ft1.setTourId(tour1.getTourId());
        ft1.setDisplayOrder(1);

        FeaturedTour ft2 = new FeaturedTour();
        ft2.setTourId(tour2.getTourId());
        ft2.setDisplayOrder(2);

        reorderList.add(ft1);
        reorderList.add(ft2);

        String token = loginAndGetToken("i_am_manager@example.com");

        mockMvc.perform(put("/featured-tours/reorder")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reorderList)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Tour " + tour2.getTourId() + " is not featured"));
    }

    @Test
    void reorderFeaturedTours_unauthorized_shouldReturn401() throws Exception {
        List<FeaturedTour> reorderList = new ArrayList<>();
        FeaturedTour ft = new FeaturedTour();
        ft.setTourId(1L);
        ft.setDisplayOrder(1);
        reorderList.add(ft);

        mockMvc.perform(put("/featured-tours/reorder")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reorderList)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }

    @Test
    void reorderFeaturedTours_asPartner_shouldReturn403() throws Exception {
        List<FeaturedTour> reorderList = new ArrayList<>();
        FeaturedTour ft = new FeaturedTour();
        ft.setTourId(1L);
        ft.setDisplayOrder(1);
        reorderList.add(ft);

        String token = loginAndGetToken("i_am_partner@example.com");

        mockMvc.perform(put("/featured-tours/reorder")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reorderList)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("You don't have permission to access this resource. Required level: Manager"));
    }
}