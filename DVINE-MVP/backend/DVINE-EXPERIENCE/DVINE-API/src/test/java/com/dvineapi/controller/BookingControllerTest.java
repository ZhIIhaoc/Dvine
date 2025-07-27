package com.dvineapi.controller;

import com.dvinedao.domain.Booking;
import com.dvinedao.domain.CreateBookingRequest;
import com.dvinedao.domain.Tour;
import com.dvinedao.domain.User;
import com.dvinedao.mapper.BookingMapper;
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
import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BookingMapper bookingMapper;

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
        tour.setTitle("Test Tour for Booking");
        tour.setDestination("Sydney, Australia");
        tour.setDescription("Amazing test tour for booking");
        tour.setRegularPrice(BigDecimal.valueOf(299.99));
        tour.setPremiumPrice(BigDecimal.valueOf(269.99));
        tour.setCreatedBy(1L);
        tour.setPrimaryImageUrl("https://example.com/test.jpg");
        tourMapper.createTour(tour);
        return tour;
    }

    private Booking createTestBooking(Long userId, Long tourId) {
        Booking booking = new Booking();
        booking.setUserId(userId);
        booking.setTourId(tourId);
        booking.setBookingReference("DVINE-20250725-1234");
        booking.setQuantity(2);
        booking.setUnitPrice(BigDecimal.valueOf(299.99));
        booking.setTotalAmount(BigDecimal.valueOf(599.98));
        booking.setCurrency("AUD");
        booking.setTravelDate(LocalDate.of(2025, 8, 15));
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        booking.setCustomerNotes("Test booking");
        bookingMapper.createBooking(booking);
        return booking;
    }

    // ================ POST /bookings/create-session ================
    @Test
    void createBookingSession_asAuthenticatedUser_shouldReturn200() throws Exception {
        Tour tour = createTestTour();
        String token = loginAndGetToken("i_am_premium@example.com");

        CreateBookingRequest request = new CreateBookingRequest();
        request.setTourId(tour.getTourId());
        request.setQuantity(2);
        request.setTravelDate(LocalDate.of(2025, 8, 15));
        request.setCustomerNotes("Anniversary celebration");

        mockMvc.perform(post("/bookings/create-session")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data.bookingId").isNumber())
                .andExpect(jsonPath("$.data.bookingReference").isString())
                .andExpect(jsonPath("$.data.checkoutUrl").isString());
    }

    @Test
    void createBookingSession_asGuest_shouldReturn200() throws Exception {
        Tour tour = createTestTour();

        CreateBookingRequest request = new CreateBookingRequest();
        request.setTourId(tour.getTourId());
        request.setQuantity(1);
        request.setTravelDate(LocalDate.of(2025, 8, 15));
        request.setCustomerNotes("First time visitor");

        mockMvc.perform(post("/bookings/create-session")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data.bookingId").isNumber());
    }



    @Test
    void createBookingSession_invalidQuantity_shouldReturn400() throws Exception {
        Tour tour = createTestTour();
        String token = loginAndGetToken("i_am_premium@example.com");

        CreateBookingRequest request = new CreateBookingRequest();
        request.setTourId(tour.getTourId());
        request.setQuantity(15); // Exceeds maximum allowed (10)
        request.setTravelDate(LocalDate.of(2025, 8, 15));

        mockMvc.perform(post("/bookings/create-session")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Quantity must be between 1 and 10"));
    }

    @Test
    void createBookingSession_invalidTravelDate_shouldReturn400() throws Exception {
        Tour tour = createTestTour();
        String token = loginAndGetToken("i_am_premium@example.com");

        CreateBookingRequest request = new CreateBookingRequest();
        request.setTourId(tour.getTourId());
        request.setQuantity(2);
        request.setTravelDate(LocalDate.of(2024, 1, 15)); // Past date

        mockMvc.perform(post("/bookings/create-session")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Travel date must be in the future and within 2 years"));
    }

    @Test
    void createBookingSession_missingRequiredField_shouldReturn400() throws Exception {
        String token = loginAndGetToken("i_am_premium@example.com");

        // Create request with missing tourId (required field)
        CreateBookingRequest request = new CreateBookingRequest();
        // request.setTourId(null); // Missing required field
        request.setQuantity(2);
        request.setTravelDate(LocalDate.of(2025, 8, 15));

        mockMvc.perform(post("/bookings/create-session")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").isString());
    }

    @Test
    void createBookingSession_tourNotFound_shouldReturn404() throws Exception {
        String token = loginAndGetToken("i_am_premium@example.com");

        CreateBookingRequest request = new CreateBookingRequest();
        request.setTourId(99999L); // Non-existent tour
        request.setQuantity(1);
        request.setTravelDate(LocalDate.of(2025, 8, 15));

        mockMvc.perform(post("/bookings/create-session")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(1));
    }

    @Test
    void createBookingSession_invalidToken_shouldReturn401() throws Exception {
        Tour tour = createTestTour();

        CreateBookingRequest request = new CreateBookingRequest();
        request.setTourId(tour.getTourId());
        request.setQuantity(1);
        request.setTravelDate(LocalDate.of(2025, 8, 15));

        mockMvc.perform(post("/bookings/create-session")
                        .header("Authorization", "invalid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Token is invalid or expired"));
    }

    // ================ GET /bookings/{bookingId} ================
    @Test
    void getBookingDetails_asPremiumUser_shouldReturn200() throws Exception {
        Tour tour = createTestTour();
        String token = loginAndGetToken("i_am_premium@example.com");

        Long userId = 2L; // Premium user ID
        Booking booking = createTestBooking(userId, tour.getTourId());

        mockMvc.perform(get("/bookings/{bookingId}", booking.getBookingId())
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data.bookingId").value(booking.getBookingId().intValue()))
                .andExpect(jsonPath("$.data.bookingReference").value("DVINE-20250725-1234"));
    }

    @Test
    void getBookingDetails_asOwner_shouldReturn200() throws Exception {
        Tour tour = createTestTour();
        String ownerToken = loginAndGetToken("i_am_owner@example.com");

        Long regularUserId = 1L; // Regular user ID
        Booking booking = createTestBooking(regularUserId, tour.getTourId());

        // Owner should be able to view any booking
        mockMvc.perform(get("/bookings/{bookingId}", booking.getBookingId())
                        .header("Authorization", ownerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data.bookingId").value(booking.getBookingId().intValue()))
                .andExpect(jsonPath("$.data.bookingReference").value("DVINE-20250725-1234"));
    }

    @Test
    void getBookingDetails_asManager_shouldReturn200() throws Exception {
        Tour tour = createTestTour();
        String managerToken = loginAndGetToken("i_am_manager@example.com");

        Long regularUserId = 1L; // Regular user ID
        Booking booking = createTestBooking(regularUserId, tour.getTourId());

        // Manager should be able to view any booking
        mockMvc.perform(get("/bookings/{bookingId}", booking.getBookingId())
                        .header("Authorization", managerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data.bookingId").value(booking.getBookingId().intValue()))
                .andExpect(jsonPath("$.data.bookingReference").value("DVINE-20250725-1234"));
    }

    @Test
    void getBookingDetails_notFound_shouldReturn404() throws Exception {
        String token = loginAndGetToken("i_am_premium@example.com");

        mockMvc.perform(get("/bookings/{bookingId}", 99999L)
                        .header("Authorization", token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Booking not found"));
    }

    // ================ POST /bookings/{bookingId}/cancel ================
    @Test
    void cancelBooking_asPremiumUser_shouldReturn202() throws Exception {
        Tour tour = createTestTour();
        String token = loginAndGetToken("i_am_premium@example.com");

        Long userId = 2L; // Premium user ID
        Booking booking = createTestBooking(userId, tour.getTourId());

        // Set travel date to future (more than 48 hours)
        booking.setTravelDate(LocalDate.now().plusDays(5));
        bookingMapper.updateBooking(booking);

        mockMvc.perform(post("/bookings/{bookingId}/cancel", booking.getBookingId())
                        .header("Authorization", token))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));
    }

    @Test
    void cancelBooking_asOwner_shouldReturn202() throws Exception {
        Tour tour = createTestTour();
        String ownerToken = loginAndGetToken("i_am_owner@example.com");

        Long regularUserId = 1L; // Regular user ID
        Booking booking = createTestBooking(regularUserId, tour.getTourId());

        // Set travel date to future (more than 48 hours)
        booking.setTravelDate(LocalDate.now().plusDays(5));
        bookingMapper.updateBooking(booking);

        // Owner should be able to cancel any booking
        mockMvc.perform(post("/bookings/{bookingId}/cancel", booking.getBookingId())
                        .header("Authorization", ownerToken))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));
    }

    @Test
    void cancelBooking_notFound_shouldReturn404() throws Exception {
        String token = loginAndGetToken("i_am_premium@example.com");

        mockMvc.perform(post("/bookings/{bookingId}/cancel", 99999L)
                        .header("Authorization", token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Booking not found"));
    }

    @Test
    void cancelBooking_tooClose_shouldReturn400() throws Exception {
        Tour tour = createTestTour();
        String token = loginAndGetToken("i_am_premium@example.com");

        Long userId = 2L; // Premium user ID
        Booking booking = createTestBooking(userId, tour.getTourId());

        // Set travel date to tomorrow (within 48 hours)
        booking.setTravelDate(LocalDate.now().plusDays(1));
        bookingMapper.updateBooking(booking);

        mockMvc.perform(post("/bookings/{bookingId}/cancel", booking.getBookingId())
                        .header("Authorization", token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Booking cannot be cancelled within 48 hours of travel date"));
    }

    @Test
    void cancelBooking_alreadyCancelled_shouldReturn400() throws Exception {
        Tour tour = createTestTour();
        String token = loginAndGetToken("i_am_premium@example.com");

        Long userId = 2L; // Premium user ID
        Booking booking = createTestBooking(userId, tour.getTourId());

        // Set booking status to CANCELLED
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setTravelDate(LocalDate.now().plusDays(5));
        bookingMapper.updateBooking(booking);

        mockMvc.perform(post("/bookings/{bookingId}/cancel", booking.getBookingId())
                        .header("Authorization", token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Only confirmed or pending bookings can be cancelled"));
    }

    // ================ GET /bookings/reference/{bookingReference} ================
    @Test
    void getBookingByReference_success_shouldReturn200() throws Exception {
        Tour tour = createTestTour();
        String token = loginAndGetToken("i_am_premium@example.com");

        Long userId = 2L; // Premium user ID
        Booking booking = createTestBooking(userId, tour.getTourId());

        mockMvc.perform(get("/bookings/reference/{bookingReference}", booking.getBookingReference())
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data.bookingReference").value("DVINE-20250725-1234"));
    }

    @Test
    void getBookingByReference_notFound_shouldReturn404() throws Exception {
        String token = loginAndGetToken("i_am_premium@example.com");

        mockMvc.perform(get("/bookings/reference/{bookingReference}", "DVINE-20250725-9999")
                        .header("Authorization", token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(1));
    }

    @Test
    void getBookingByReference_invalidFormat_shouldReturn400() throws Exception {
        String token = loginAndGetToken("i_am_premium@example.com");

        mockMvc.perform(get("/bookings/reference/{bookingReference}", "INVALID-FORMAT")
                        .header("Authorization", token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(1));
    }

    // ================ GET /bookings/user/{userId} ================
    @Test
    void getUserBookings_asPremiumUser_shouldReturn200() throws Exception {
        Tour tour = createTestTour();
        String token = loginAndGetToken("i_am_premium@example.com");

        Long userId = 2L; // Premium user ID
        createTestBooking(userId, tour.getTourId());

        mockMvc.perform(get("/bookings/user/{userId}", userId)
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].bookingId").isNumber());
    }

    @Test
    void getUserBookings_asOwner_shouldReturn200() throws Exception {
        Tour tour = createTestTour();
        String ownerToken = loginAndGetToken("i_am_owner@example.com");

        Long regularUserId = 1L; // Regular user ID
        createTestBooking(regularUserId, tour.getTourId());

        // Owner should be able to view any user's bookings
        mockMvc.perform(get("/bookings/user/{userId}", regularUserId)
                        .header("Authorization", ownerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void getUserBookings_userNotFound_shouldReturn404() throws Exception {
        String token = loginAndGetToken("i_am_partner@example.com");

        mockMvc.perform(get("/bookings/user/{userId}", 99999L)
                        .header("Authorization", token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not found"));
    }

    @Test
    void getUserBookings_unauthorized_shouldReturn401() throws Exception {
        mockMvc.perform(get("/bookings/user/{userId}", 1L))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }

    // ================ GET /bookings/tour/{tourId} - Partner+ access ================
    @Test
    void getTourBookings_asOwner_shouldReturn200() throws Exception {
        Tour tour = createTestTour();
        String token = loginAndGetToken("i_am_owner@example.com");

        createTestBooking(1L, tour.getTourId());

        mockMvc.perform(get("/bookings/tour/{tourId}", tour.getTourId())
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void getTourBookings_asManager_shouldReturn200() throws Exception {
        Tour tour = createTestTour();
        String token = loginAndGetToken("i_am_manager@example.com");

        createTestBooking(1L, tour.getTourId());

        mockMvc.perform(get("/bookings/tour/{tourId}", tour.getTourId())
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void getTourBookings_asPartner_shouldReturn200() throws Exception {
        Tour tour = createTestTour();
        String token = loginAndGetToken("i_am_partner@example.com");

        createTestBooking(1L, tour.getTourId());

        mockMvc.perform(get("/bookings/tour/{tourId}", tour.getTourId())
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void getTourBookings_asPremium_shouldReturn403() throws Exception {
        Tour tour = createTestTour();
        String token = loginAndGetToken("i_am_premium@example.com");

        mockMvc.perform(get("/bookings/tour/{tourId}", tour.getTourId())
                        .header("Authorization", token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("You don't have permission to access this resource. Required level: Partner"));
    }

    @Test
    void getTourBookings_asRegular_shouldReturn403() throws Exception {
        Tour tour = createTestTour();
        String token = loginAndGetToken("i_am_regular@example.com");

        mockMvc.perform(get("/bookings/tour/{tourId}", tour.getTourId())
                        .header("Authorization", token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("You don't have permission to access this resource. Required level: Partner"));
    }

    @Test
    void getTourBookings_tourNotFound_shouldReturn404() throws Exception {
        String token = loginAndGetToken("i_am_partner@example.com");

        mockMvc.perform(get("/bookings/tour/{tourId}", 99999L)
                        .header("Authorization", token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Tour not found"));
    }

    @Test
    void getTourBookings_unauthorized_shouldReturn401() throws Exception {
        Tour tour = createTestTour();

        mockMvc.perform(get("/bookings/tour/{tourId}", tour.getTourId()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }

    // ================ GET /bookings/admin/all - Manager+ access ================
    @Test
    void getAllBookingsWithDetails_asManager_shouldReturn200() throws Exception {
        Tour tour = createTestTour();
        String token = loginAndGetToken("i_am_manager@example.com");

        createTestBooking(1L, tour.getTourId());

        mockMvc.perform(get("/bookings/admin/all")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void getAllBookingsWithDetails_asOwner_shouldReturn200() throws Exception {
        Tour tour = createTestTour();
        String token = loginAndGetToken("i_am_owner@example.com");

        createTestBooking(1L, tour.getTourId());

        mockMvc.perform(get("/bookings/admin/all")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void getAllBookingsWithDetails_asPartner_shouldReturn403() throws Exception {
        String token = loginAndGetToken("i_am_partner@example.com");

        mockMvc.perform(get("/bookings/admin/all")
                        .header("Authorization", token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("You don't have permission to access this resource. Required level: Manager"));
    }

    @Test
    void getAllBookingsWithDetails_asPremium_shouldReturn403() throws Exception {
        String token = loginAndGetToken("i_am_premium@example.com");

        mockMvc.perform(get("/bookings/admin/all")
                        .header("Authorization", token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("You don't have permission to access this resource. Required level: Manager"));
    }

    @Test
    void getAllBookingsWithDetails_unauthorized_shouldReturn401() throws Exception {
        mockMvc.perform(get("/bookings/admin/all"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }
}