package com.dvineapi.controller;

import com.dvinedao.domain.Image;
import com.dvinedao.domain.Tour;
import com.dvinedao.domain.Catalogue;
import com.dvinedao.domain.User;
import com.dvinedao.mapper.CatalogueMapper;
import com.dvinedao.mapper.ImageMapper;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

import java.math.BigDecimal;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.assertj.core.api.Assertions.assertThat;
import com.dvinedao.mapper.PendingTourMapper;
import com.dvinedao.domain.PendingTour;


@SpringBootTest
@AutoConfigureMockMvc
@Transactional  // Ensure each test method is automatically rolled back after completion to keep tables clean
public class TourControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TourMapper tourMapper;
    @Autowired
    private CatalogueMapper catalogueMapper;
    @Autowired
    private ImageMapper imageMapper;
    @Autowired
    private PendingTourMapper pendingTourMapper;
    @Autowired
    private ObjectMapper objectMapper;

    private String loginAndGetToken(String email) throws Exception {
        User loginUser = new User();
        loginUser.setEmail(email);
        loginUser.setPassword("1234"); // plain‐text password

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

    private Catalogue catalogue;
    private Tour tour1;
    private Tour tour2;

    @BeforeEach
    public void setup() {
        // 1) Create a parent Catalogue
        Catalogue c = new Catalogue();
        c.setTitle("Test Catalogue");
        c.setDescription("Catalogue Desc");
        c.setCoverImage("https://cdn/catalogue.jpg");
        catalogueMapper.createCatalogue(c);
        this.catalogue = c;

        // 2) Insert two fixed Tours (created by Owner userId=5)
        this.tour1 = makeTour(
                c.getCatalogueId(),
                "Sydney Coastal Walk",
                "Sydney, Australia",
                "See the cliffs and beaches.",
                new BigDecimal("129.99"),
                "https://your-cdn.com/tour101.jpg",
                5L  // Owner user ID
        );
        this.tour2 = makeTour(
                c.getCatalogueId(),
                "Outback Adventure",
                "Northern Territory, Australia",
                "Explore the heart of Australia.",
                new BigDecimal("499.99"),
                "https://your-cdn.com/tour102.jpg",
                5L  // Owner user ID
        );

    }

    private Tour makeTour(Long catalogueId,
                          String title,
                          String destination,
                          String description,
                          BigDecimal price,
                          String primaryImageUrl,
                          Long createdBy) {
        Tour t = new Tour();
        t.setCatalogueId(catalogueId);
        t.setTitle(title);
        t.setDestination(destination);
        t.setDescription(description);
        t.setRegularPrice(price);
        t.setPremiumPrice(price.multiply(new BigDecimal("0.9")).setScale(2, java.math.RoundingMode.HALF_UP)); // 10% discount for premium
        t.setPrimaryImageUrl(primaryImageUrl);
        t.setCreatedBy(createdBy);
        // After insertion, t.getTourId() will be auto-filled
        tourMapper.createTour(t);
        makeImage(t.getTourId(), primaryImageUrl, true);
        makeImage(t.getTourId(), primaryImageUrl.replace(".jpg", "_2.jpg"), false);
        return t;
    }
    private Image makeImage(Long tourId, String imageUrl, Boolean isPrimary) {
        Image image = new Image();
        image.setTourId(tourId);
        image.setImageUrl(imageUrl);
        image.setIsPrimary(isPrimary);
        // After insertion, image.getImageId() will be auto-filled
        imageMapper.createImages(List.of(image));
        return image;
    }

    @Test
    public void search_shouldReturnExactlyThoseTwoTours() throws Exception {
        mockMvc.perform(get("/tours")
                        // Key: add catalogueId parameter
                        .param("catalogueId", catalogue.getCatalogueId().toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data", hasSize(2)))
                // Validate first record
                .andExpect(jsonPath("$.data[0].tourId").value(tour1.getTourId()))
                .andExpect(jsonPath("$.data[0].title").value("Sydney Coastal Walk"))
                .andExpect(jsonPath("$.data[0].destination").value("Sydney, Australia"))
                .andExpect(jsonPath("$.data[0].description").value("See the cliffs and beaches."))
                .andExpect(jsonPath("$.data[0].regularPrice").value(129.99))
                .andExpect(jsonPath("$.data[0].premiumPrice").value(116.99))
                .andExpect(jsonPath("$.data[0].primaryImageUrl")
                                .isString())
                // Validate second record
                .andExpect(jsonPath("$.data[1].tourId").value(tour2.getTourId()))
                .andExpect(jsonPath("$.data[1].title").value("Outback Adventure"))
                .andExpect(jsonPath("$.data[1].destination").value("Northern Territory, Australia"))
                .andExpect(jsonPath("$.data[1].description").value("Explore the heart of Australia."))
                .andExpect(jsonPath("$.data[1].regularPrice").value(499.99))
                .andExpect(jsonPath("$.data[1].premiumPrice").value(449.99))
                .andExpect(jsonPath("$.data[1].primaryImageUrl")
                        .isString());
    }
    @Test
    public void search_withNonexistentCatalogueId_shouldReturn404() throws Exception {
        mockMvc.perform(get("/tours")
                        .param("catalogueId", "99999")
                        .contentType(MediaType.APPLICATION_JSON))
                // Expect 404 Not Found
                .andExpect(status().isNotFound())
                // Response body should have code = 1
                .andExpect(jsonPath("$.code").value(1))
                // msg should be "Tour not found"
                .andExpect(jsonPath("$.msg").value("Tour not found"));
    }
    /**
     * GET /tours/{tourId} - When tourId doesn't exist, return 404 + { code:1, msg:"Tour not found" }
     */
    @Test
    public void getById_notFound_shouldReturn404() throws Exception {
        mockMvc.perform(get("/tours/{tourId}", 99999L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Tour not found"));
    }

    @Test
    public void getById_success_shouldReturnTourDetailWithImages() throws Exception {
        mockMvc.perform(get("/tours/{tourId}", tour1.getTourId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                // Note: use $.data.xxx here
                .andExpect(jsonPath("$.data.tourId").value(tour1.getTourId().intValue()))
                .andExpect(jsonPath("$.data.catalogueId").value(catalogue.getCatalogueId().intValue()))
                .andExpect(jsonPath("$.data.title").value("Sydney Coastal Walk"))
                .andExpect(jsonPath("$.data.destination").value("Sydney, Australia"))
                .andExpect(jsonPath("$.data.description").value("See the cliffs and beaches."))
                .andExpect(jsonPath("$.data.regularPrice").value(129.99))
                .andExpect(jsonPath("$.data.premiumPrice").value(116.99))
                // images is an array of length 2
                .andExpect(jsonPath("$.data.images", hasSize(2)))
                .andExpect(jsonPath("$.data.images[0]").isString())
                .andExpect(jsonPath("$.data.images[1]").isString());
    }
    @Test
    public void createTour_asPartner_shouldReturn202() throws Exception {
        // 1) Login as partner (catalogue.creatorId == 4)
        String token = loginAndGetToken("i_am_partner@example.com");

        // 2) Create a Tour object as request body
        Tour req = new Tour();
        req.setCatalogueId(catalogue.getCatalogueId());
        req.setTitle("Great Barrier Reef Adventure");
        req.setDestination("Cairns, Australia");
        req.setDescription("Explore the underwater wonders of the reef.");
        req.setRegularPrice(new BigDecimal("299.99"));
        req.setPremiumPrice(new BigDecimal("269.99"));
        req.setPrimaryImageUrl("https://your-cdn.com/reef.jpg");
        // Remember to assign values to images field too
        req.setImages(List.of(
                "https://your-cdn.com/tour101_1.jpg",
                "https://your-cdn.com/tour101_2.jpg"
        ));

        // 3) Execute request and assert - Partners submit for approval (202 ACCEPTED)
        mockMvc.perform(post("/tours")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isAccepted()) // 202 ACCEPTED for Partners
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));

        // 4) Verify data is actually saved in pending_tours table, not tours table
        List<PendingTour> pendingTours = pendingTourMapper.findByStatus(0); // 0 = PENDING status
        assertThat(pendingTours).isNotEmpty();
        
        // Verify the latest submitted pending tour is the one we just created
        PendingTour latestPending = pendingTours.get(pendingTours.size() - 1);
        assertThat(latestPending.getTitle()).isEqualTo("Great Barrier Reef Adventure");
        assertThat(latestPending.getDestination()).isEqualTo("Cairns, Australia");
        assertThat(latestPending.getRegularPrice()).isEqualTo(new BigDecimal("299.99"));
        assertThat(latestPending.getPremiumPrice()).isEqualTo(new BigDecimal("269.99"));
        assertThat(latestPending.getOperationType()).isEqualTo(PendingTour.OperationType.CREATE);
        assertThat(latestPending.getStatus()).isEqualTo(0); // PENDING status
    }
    @Test
    public void createTour_success_shouldReturn201_asAdminOwner() throws Exception {
        // 1) Login as Owner (ADMIN)
        String token = loginAndGetToken("i_am_owner@example.com");

        // 2) Create request body, note catalogue.creatorId == 4L (the Catalogue in BeforeEach)
        Tour req = new Tour();
        req.setCatalogueId(catalogue.getCatalogueId());
        req.setTitle("Great Barrier Reef Adventure");
        req.setDestination("Cairns, Australia");
        req.setDescription("Explore the underwater wonders of the reef.");
        req.setRegularPrice(new BigDecimal("299.99"));
        req.setPremiumPrice(new BigDecimal("269.99"));
        req.setPrimaryImageUrl("https://your-cdn.com/reef.jpg");
        req.setImages(List.of(
                "https://your-cdn.com/tour101_1.jpg",
                "https://your-cdn.com/tour101_2.jpg"
        ));

        // 3) Execute request and assert Created
        mockMvc.perform(post("/tours")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));
    }
    @Test
    public void createTour_unauthenticated_shouldReturn401() throws Exception {
        // Create a valid request body (content doesn't matter since it will be intercepted as 401 first)
        Tour req = new Tour();
        req.setCatalogueId(catalogue.getCatalogueId());
        req.setTitle("Reef Adventure");
        req.setDestination("Cairns, Australia");
        req.setDescription("Underwater wonders.");
        req.setRegularPrice(new BigDecimal("299.99"));
        req.setPremiumPrice(new BigDecimal("269.99"));
        req.setPrimaryImageUrl("https://your-cdn.com/reef.jpg");
        req.setImages(List.of("https://your-cdn.com/tour101_1.jpg"));

        mockMvc.perform(post("/tours")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }
    /**
     * POST /tours - Login as Premium Member, due to @PermissionCheck trigger, return 403 +
     * {code:1, msg:"You don't have permission to access this resource"}
     */
    @Test
    public void createTour_shouldReturn403_asPremiumMember() throws Exception {
        // Login as premium member
        String token = loginAndGetToken("i_am_premium@example.com");

        // Create request body
        Tour req = new Tour();
        req.setCatalogueId(catalogue.getCatalogueId());
        req.setTitle("Reef Adventure");
        req.setDestination("Cairns, Australia");
        req.setDescription("Underwater wonders.");
        req.setRegularPrice(new BigDecimal("299.99"));
        req.setPremiumPrice(new BigDecimal("269.99"));
        req.setPrimaryImageUrl("https://your-cdn.com/reef.jpg");
        req.setImages(List.of("https://your-cdn.com/tour101_1.jpg"));

        mockMvc.perform(post("/tours")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg")
                        .isString());
    }
    
    @Test
    public void createTour_catalogueNotFound_shouldReturn404() throws Exception {
        String token = loginAndGetToken("i_am_partner@example.com");

        // Create request body with non-existent catalogueId
        Tour req = new Tour();
        req.setCatalogueId(99999L); // Non-existent catalogue ID
        req.setTitle("Reef Adventure");
        req.setDestination("Cairns, Australia");
        req.setDescription("Underwater wonders.");
        req.setRegularPrice(new BigDecimal("299.99"));
        req.setPremiumPrice(new BigDecimal("269.99"));
        req.setPrimaryImageUrl("https://your-cdn.com/reef.jpg");
        req.setImages(List.of("https://your-cdn.com/tour101_1.jpg"));

        mockMvc.perform(post("/tours")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Catalogue not found"));
    }

    @Test
    public void deleteTour_unauthenticated_shouldReturn401() throws Exception {
        // No token
        mockMvc.perform(delete("/tours")
                        .param("tourId", tour1.getTourId().toString()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }
    @Test
    public void deleteTour_shouldReturn403_asPremiumMember() throws Exception {
        String token = loginAndGetToken("i_am_premium@example.com");

        mockMvc.perform(delete("/tours")
                        .header("Authorization", token)
                        .param("tourId", tour1.getTourId().toString()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg")
                        .isString());
    }
    @Test
    public void deleteTour_shouldReturn403_asPartnerdeleteOtherTour() throws Exception {
        String token = loginAndGetToken("i_am_partner@example.com");

        mockMvc.perform(delete("/tours")
                        .header("Authorization", token)
                        .param("tourId", tour1.getTourId().toString()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg")
                        .value("Partner can only modify the tour created by themselves"));
    }
    @Test
    public void deleteTour_shouldReturn404_forNonexistentTour() throws Exception {
        // Login as Owner (ADMIN)
        String token = loginAndGetToken("i_am_owner@example.com");

        mockMvc.perform(delete("/tours")
                        .header("Authorization", token)
                        .param("tourId", "99999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Tour not found"));
    }
    @Test
    public void deleteTour_success_shouldReturn200() throws Exception {
        // Login as Owner
        String token = loginAndGetToken("i_am_owner@example.com");

        // Execute deletion of tour1
        mockMvc.perform(delete("/tours")
                        .header("Authorization", token)
                        .param("tourId", tour1.getTourId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));
    }

    @Test
    public void deleteTour_asPartner_deleteOwnTour_shouldSubmitToPending() throws Exception {
        // 1. Owner creates catalogue (since partner cannot create catalogue)
        String ownerToken = loginAndGetToken("i_am_owner@example.com");
        
        Catalogue ownerCatalogue = new Catalogue();
        ownerCatalogue.setTitle("Owner's Catalogue for Partner Delete");
        ownerCatalogue.setDescription("Catalogue created by Owner for Partner to delete tour");
        ownerCatalogue.setCoverImage("https://cdn/owner-catalogue.jpg");
        catalogueMapper.createCatalogue(ownerCatalogue);

        // 2. Partner creates tour in Owner's catalogue (simulate approved status)
        String partnerToken = loginAndGetToken("i_am_partner@example.com");
        
        Tour partnerTour = makeTour(
                ownerCatalogue.getCatalogueId(),
                "Partner's Tour to Delete",
                "Partner Destination",
                "Tour created by partner for deletion test",
                new BigDecimal("299.99"),
                "https://cdn/partner-tour-delete.jpg",
                3L  // Partner user ID
        );

        // 3. Partner deletes their own created tour (should submit to pending_tours for approval)
        mockMvc.perform(delete("/tours")
                        .header("Authorization", partnerToken)
                        .param("tourId", partnerTour.getTourId().toString()))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));

        // Verify deletion request is submitted to pending_tours table for approval
        List<PendingTour> pendingTours = pendingTourMapper.findByStatus(0); // 0 = PENDING status
        assertThat(pendingTours).isNotEmpty();
        
        // Verify the latest submitted pending tour is our deletion request
        PendingTour latestPending = pendingTours.get(pendingTours.size() - 1);
        assertThat(latestPending.getOperationType()).isEqualTo(PendingTour.OperationType.DELETE);
        assertThat(latestPending.getOriginalTourId()).isEqualTo(partnerTour.getTourId()); // Points to the tour being deleted
        assertThat(latestPending.getStatus()).isEqualTo(0); // PENDING status
    }
    @Test
    public void updateTour_success_shouldReturn200() throws Exception {
        // Login as Owner
        String token = loginAndGetToken("i_am_owner@example.com");

        // Create request body
        Tour req = new Tour();
        req.setTourId(tour1.getTourId());
        req.setCatalogueId(catalogue.getCatalogueId());
        req.setTitle("Updated Title");
        req.setDestination("Updated Destination");
        req.setDescription("Updated Description");
        req.setRegularPrice(new BigDecimal("199.99"));
        req.setPremiumPrice(new BigDecimal("179.99"));
        req.setPrimaryImageUrl("https://your-cdn.com/updated.jpg");
        req.setImages(List.of(
                "https://your-cdn.com/updated1.jpg",
                "https://your-cdn.com/updated2.jpg"
        ));

        mockMvc.perform(put("/tours")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));

        // Verify update is applied directly to tours table, not pending_tours table
        Tour updatedTour = tourMapper.findById(tour1.getTourId());
        assertThat(updatedTour).isNotNull();
        assertThat(updatedTour.getTitle()).isEqualTo("Updated Title");
        assertThat(updatedTour.getDestination()).isEqualTo("Updated Destination");
        assertThat(updatedTour.getDescription()).isEqualTo("Updated Description");
        assertThat(updatedTour.getRegularPrice()).isEqualTo(new BigDecimal("199.99"));
        assertThat(updatedTour.getPremiumPrice()).isEqualTo(new BigDecimal("179.99"));
        
        // Verify this update didn't create pending_tours record (Owner/Admin direct update)
        List<PendingTour> pendingTours = pendingTourMapper.findByStatus(0); // 0 = PENDING status
        // Count how many pending tours are related to current tourId (should be 0)
        long relatedPendingCount = pendingTours.stream()
                .filter(pt -> pt.getOriginalTourId() != null && pt.getOriginalTourId().equals(tour1.getTourId()))
                .count();
        assertThat(relatedPendingCount).isEqualTo(0);
    }
    @Test
    public void updateTour_unauthenticated_shouldReturn401() throws Exception {
        // Without Authorization
        Tour req = new Tour();
        req.setTourId(tour1.getTourId());
        req.setCatalogueId(catalogue.getCatalogueId());
        req.setTitle("Whatever");

        mockMvc.perform(put("/tours")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }
    @Test
    public void updateTour_asPremiumMember_shouldReturn403() throws Exception {
        String token = loginAndGetToken("i_am_premium@example.com");

        Tour req = new Tour();
        req.setTourId(tour1.getTourId());
        req.setCatalogueId(catalogue.getCatalogueId());
        req.setTitle("Nope");

        mockMvc.perform(put("/tours")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").isString());
    }
    @Test
    public void updateTour_asPartner_shouldReturn200() throws Exception {
        // Create a new catalogue and tour inside the test
        Catalogue testCatalogue = new Catalogue();
        testCatalogue.setTitle("Test Catalogue for Update");
        testCatalogue.setDescription("Test Catalogue Desc");
        testCatalogue.setCoverImage("https://cdn/test-catalogue.jpg");
        catalogueMapper.createCatalogue(testCatalogue);

        // Create a tour (created by Partner)
        Tour testTour = makeTour(
                testCatalogue.getCatalogueId(),
                "Original Tour",
                "Original Destination",
                "Original Description",
                new BigDecimal("199.99"),
                "https://cdn/original-tour.jpg",
                3L  // Partner user ID
        );

        // Partner tries to update this tour
        String token = loginAndGetToken("i_am_partner@example.com");

        Tour req = new Tour();
        req.setTourId(testTour.getTourId());
        req.setCatalogueId(testCatalogue.getCatalogueId());
        req.setTitle("Updated by Partner");
        req.setDestination("Updated Destination");

        req.setRegularPrice(new BigDecimal("399.99"));
        req.setPremiumPrice(new BigDecimal("359.99"));

        mockMvc.perform(put("/tours")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));

        // Verify data is actually saved in pending_tours table, not directly updated to tours table
        List<PendingTour> pendingTours = pendingTourMapper.findByStatus(0); // 0 = PENDING status
        assertThat(pendingTours).isNotEmpty();

        // Verify the latest submitted pending tour is our update request
        PendingTour latestPending = pendingTours.get(pendingTours.size() - 1);
        assertThat(latestPending.getTitle()).isEqualTo("Updated by Partner");
        assertThat(latestPending.getDestination()).isEqualTo("Updated Destination");
        assertThat(latestPending.getRegularPrice()).isEqualTo(new BigDecimal("399.99"));
        assertThat(latestPending.getPremiumPrice()).isEqualTo(new BigDecimal("359.99"));
        assertThat(latestPending.getOperationType()).isEqualTo(PendingTour.OperationType.UPDATE);
        assertThat(latestPending.getOriginalTourId()).isEqualTo(testTour.getTourId()); // Points to the tour being updated
        assertThat(latestPending.getStatus()).isEqualTo(0); // PENDING status
    }
    @Test
    public void updateTour_notFoundTour_shouldReturn404() throws Exception {
        String token = loginAndGetToken("i_am_owner@example.com");

        Tour req = new Tour();
        req.setTourId(99999L); // Non-existent tourId
        req.setCatalogueId(catalogue.getCatalogueId());
        req.setTitle("This tour doesn't exist");
        req.setDestination("Nowhere");
        req.setDescription("This should fail");
        req.setRegularPrice(new BigDecimal("999.99"));
        req.setPremiumPrice(new BigDecimal("899.99"));

        mockMvc.perform(put("/tours")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Tour not found"));
    }

    @Test
    public void updateTour_notFoundCatalogue_shouldReturn404() throws Exception {
        String token = loginAndGetToken("i_am_owner@example.com");

        Tour req = new Tour();
        req.setTourId(tour1.getTourId());
        req.setCatalogueId(99999L);
        req.setTitle("Won't work");
        req.setCreatedBy(5L);

        mockMvc.perform(put("/tours")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Catalogue not found"));
    }

    @Test
    public void updateTour_asPartner_updateOwnTour_shouldSubmitToPending() throws Exception {
        // 1. Owner creates catalogue (since partner cannot create catalogue)
        String ownerToken = loginAndGetToken("i_am_owner@example.com");
        
        Catalogue ownerCatalogue = new Catalogue();
        ownerCatalogue.setTitle("Owner's Catalogue for Partner");
        ownerCatalogue.setDescription("Catalogue created by Owner for Partner to use");
        ownerCatalogue.setCoverImage("https://cdn/owner-catalogue.jpg");
        catalogueMapper.createCatalogue(ownerCatalogue);

        // 2. Partner creates tour in Owner's catalogue and gets approval (simulate approved status)
        String partnerToken = loginAndGetToken("i_am_partner@example.com");
        
        Tour partnerTour = makeTour(
                ownerCatalogue.getCatalogueId(),
                "Partner's Tour in Owner Catalogue",
                "Partner Destination",
                "Tour created by partner and already approved",
                new BigDecimal("299.99"),
                "https://cdn/partner-tour.jpg",
                3L  // Partner user ID
        );

        // 3. Partner updates their own created tour (should submit to pending_tours for re-approval)
        Tour updateReq = new Tour();
        updateReq.setTourId(partnerTour.getTourId());
        updateReq.setCatalogueId(ownerCatalogue.getCatalogueId());
        updateReq.setTitle("Updated Partner Tour");
        updateReq.setDestination("Updated Destination");
        updateReq.setDescription("Updated by partner for approval");
        updateReq.setRegularPrice(new BigDecimal("399.99"));
        updateReq.setPremiumPrice(new BigDecimal("359.99"));

        mockMvc.perform(put("/tours")
                        .header("Authorization", partnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));

        // Verify update request is submitted to pending_tours table for approval
        List<PendingTour> pendingTours = pendingTourMapper.findByStatus(0); // 0 = PENDING status
        assertThat(pendingTours).isNotEmpty();
        
        // Verify the latest submitted pending tour is our update request
        PendingTour latestPending = pendingTours.get(pendingTours.size() - 1);
        assertThat(latestPending.getTitle()).isEqualTo("Updated Partner Tour");
        assertThat(latestPending.getDestination()).isEqualTo("Updated Destination");
        assertThat(latestPending.getRegularPrice()).isEqualTo(new BigDecimal("399.99"));
        assertThat(latestPending.getPremiumPrice()).isEqualTo(new BigDecimal("359.99"));
        assertThat(latestPending.getOperationType()).isEqualTo(PendingTour.OperationType.UPDATE);
        assertThat(latestPending.getOriginalTourId()).isEqualTo(partnerTour.getTourId());
        assertThat(latestPending.getStatus()).isEqualTo(0); // PENDING status
    }




    @Test
    public void updateTour_asPartner_updateOthersTour_shouldReturn403() throws Exception {
        // 1. Owner creates catalogue and tour
        String ownerToken = loginAndGetToken("i_am_owner@example.com");

        Catalogue ownerCatalogue = new Catalogue();
        ownerCatalogue.setTitle("Owner's Private Catalogue");
        ownerCatalogue.setDescription("Catalogue and tour both created by Owner");
        ownerCatalogue.setCoverImage("https://cdn/owner-catalogue.jpg");
        catalogueMapper.createCatalogue(ownerCatalogue);

        // Owner creates tour
        Tour ownerTour = makeTour(
                ownerCatalogue.getCatalogueId(),
                "Owner's Tour",
                "Owner Destination",
                "Tour created by owner",
                new BigDecimal("199.99"),
                "https://cdn/owner-tour.jpg",
                5L  // Owner user ID
        );

        // 2. Partner tries to update Owner's created tour should return 403
        String partnerToken = loginAndGetToken("i_am_partner@example.com");

        Tour updateReq = new Tour();
        updateReq.setTourId(ownerTour.getTourId());
        updateReq.setCatalogueId(ownerCatalogue.getCatalogueId());
        updateReq.setTitle("Partner trying to update Owner's tour");
        updateReq.setDestination("Unauthorized update");
        updateReq.setDescription("This should be forbidden");
        updateReq.setRegularPrice(new BigDecimal("999.99"));
        updateReq.setPremiumPrice(new BigDecimal("899.99"));

        mockMvc.perform(put("/tours")
                        .header("Authorization", partnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Partner can only modify the tour created by themselves"));
    }



}