package com.dvineapi.controller;

import com.dvinedao.domain.Booking;
import com.dvinedao.domain.Payment;
import com.dvinedao.domain.Tour;
import com.dvinedao.domain.User;
import com.dvinedao.mapper.BookingMapper;
import com.dvinedao.mapper.PaymentMapper;
import com.dvinedao.mapper.TourMapper;
import com.dvineservice.util.StripeUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.model.Refund;
import com.stripe.model.checkout.Session;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PaymentMapper paymentMapper;

    @Autowired
    private BookingMapper bookingMapper;

    @Autowired
    private TourMapper tourMapper;
    
    @MockBean
    private StripeUtil stripeUtil;

    private String loginAndGetToken(String email) throws Exception {
        User loginUser = new User();
        loginUser.setEmail(email);
        loginUser.setPassword("1234");

        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType("application/json")
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
        tour.setTitle("Test Tour for Payment");
        tour.setDestination("Sydney, Australia");
        tour.setDescription("Amazing test tour for payment");
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

    private Payment createTestPayment(Long userId, Long bookingId) {

        Payment payment = new Payment();
        payment.setUserId(userId);
        payment.setBookingId(bookingId);
        payment.setStripeSessionId("cs_test_a1B2c3D4e5F6g7H8i9J0k1L2");
        payment.setStripePaymentIntentId("pi_3MtwBw2eZvKYlo2C0KQC1234");
        payment.setAmount(BigDecimal.valueOf(599.98));
        payment.setCurrency("AUD");
        payment.setStatus(Payment.PaymentStatus.SUCCEEDED);
        payment.setPaymentMethod("card");
        payment.setStripeCustomerId("cus_ABCD1234567890");
        payment.setRefundAmount(BigDecimal.ZERO);
        payment.setPaidAt(LocalDateTime.now());
        payment.setCreateTime(LocalDateTime.now());
        payment.setUpdateTime(LocalDateTime.now());
        paymentMapper.createPayment(payment);
        return payment;
    }

    // ================ GET /payments/booking/{bookingId} ================
    @Test
    void getPaymentByBookingId_success_shouldReturn200() throws Exception {
        Tour tour = createTestTour();
        String token = loginAndGetToken("i_am_premium@example.com");

        Long userId = 2L; // Premium user ID
        Booking booking = createTestBooking(userId, tour.getTourId());
        Payment payment = createTestPayment(userId, booking.getBookingId());

        mockMvc.perform(get("/payments/booking/{bookingId}", booking.getBookingId())
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data.paymentId").value(payment.getPaymentId().intValue()))
                .andExpect(jsonPath("$.data.amount").value(599.98))
                .andExpect(jsonPath("$.data.currency").value("AUD"))
                .andExpect(jsonPath("$.data.status").value("SUCCEEDED"));
    }

    @Test
    void getPaymentByBookingId_notFound_shouldReturn404() throws Exception {
        String token = loginAndGetToken("i_am_premium@example.com");

        mockMvc.perform(get("/payments/booking/{bookingId}", 99999L)
                        .header("Authorization", token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Payment not found"));
    }

    @Test
    void getPaymentByBookingId_unauthorized_shouldReturn401() throws Exception {
        mockMvc.perform(get("/payments/booking/{bookingId}", 1L))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }

    // ================ GET /payments/{paymentId} ================
    @Test
    void getPaymentDetails_success_shouldReturn200() throws Exception {
        Tour tour = createTestTour();
        String token = loginAndGetToken("i_am_premium@example.com");

        Long userId = 2L; // Premium user ID
        Booking booking = createTestBooking(userId, tour.getTourId());
        Payment payment = createTestPayment(userId, booking.getBookingId());

        mockMvc.perform(get("/payments/{paymentId}", payment.getPaymentId())
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data.paymentId").value(payment.getPaymentId().intValue()))
                .andExpect(jsonPath("$.data.amount").value(599.98));
    }

    @Test
    void getPaymentDetails_notFound_shouldReturn404() throws Exception {
        String token = loginAndGetToken("i_am_premium@example.com");

        mockMvc.perform(get("/payments/{paymentId}", 99999L)
                        .header("Authorization", token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Payment not found"));
    }

    @Test
    void getPaymentDetails_accessDenied_shouldReturn403() throws Exception {
        Tour tour = createTestTour();
        String token = loginAndGetToken("i_am_premium@example.com");

        Long otherUserId = 1L; // Different user
        Booking booking = createTestBooking(otherUserId, tour.getTourId());
        Payment payment = createTestPayment(otherUserId, booking.getBookingId());

        mockMvc.perform(get("/payments/{paymentId}", payment.getPaymentId())
                        .header("Authorization", token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("You can only access your own payment details"));
    }

    @Test
    void getPaymentDetails_unauthorized_shouldReturn401() throws Exception {
        mockMvc.perform(get("/payments/{paymentId}", 1L))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }

    // ================ GET /payments/user/{userId} ================
    @Test
    void getUserPayments_success_shouldReturn200() throws Exception {
        Tour tour = createTestTour();
        String token = loginAndGetToken("i_am_manager@example.com");

        Long userId = 2L; // Premium user ID
        Booking booking = createTestBooking(userId, tour.getTourId());
        createTestPayment(userId, booking.getBookingId());

        mockMvc.perform(get("/payments/user/{userId}", userId)
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void getUserPayments_asOwner_shouldReturn200() throws Exception {
        Tour tour = createTestTour();
        String ownerToken = loginAndGetToken("i_am_owner@example.com");

        Long regularUserId = 1L; // Regular user ID
        Booking booking = createTestBooking(regularUserId, tour.getTourId());
        createTestPayment(regularUserId, booking.getBookingId());

        // Owner should be able to view any user's payments
        mockMvc.perform(get("/payments/user/{userId}", regularUserId)
                        .header("Authorization", ownerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void getUserPayments_userNotFound_shouldReturn404() throws Exception {
        String token = loginAndGetToken("i_am_manager@example.com");

        mockMvc.perform(get("/payments/user/{userId}", 99999L)
                        .header("Authorization", token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not found"));
    }

    @Test
    void getUserPayments_accessDenied_shouldReturn403() throws Exception {
        String token = loginAndGetToken("i_am_premium@example.com");

        // Premium user trying to access another user's payments
        mockMvc.perform(get("/payments/user/{userId}", 1L)
                        .header("Authorization", token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("You don't have permission to access this resource. Required level: Manager"));
    }

    @Test
    void getUserPayments_unauthorized_shouldReturn401() throws Exception {
        mockMvc.perform(get("/payments/user/{userId}", 1L))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }

    // ================ GET /payments/my-payments ================
    @Test
    void getMyPayments_success_shouldReturn200() throws Exception {
        Tour tour = createTestTour();
        String token = loginAndGetToken("i_am_premium@example.com");

        Long userId = 2L; // Premium user ID
        Booking booking = createTestBooking(userId, tour.getTourId());
        createTestPayment(userId, booking.getBookingId());

        mockMvc.perform(get("/payments/my-payments")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void getMyPayments_unauthorized_shouldReturn401() throws Exception {
        mockMvc.perform(get("/payments/my-payments"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }

    // ================ GET /payments/status/{status} - Manager+ access ================
    @Test
    void getPaymentsByStatus_asManager_shouldReturn200() throws Exception {
        Tour tour = createTestTour();
        String token = loginAndGetToken("i_am_manager@example.com");

        Long userId = 1L;
        Booking booking = createTestBooking(userId, tour.getTourId());
        createTestPayment(userId, booking.getBookingId());

        mockMvc.perform(get("/payments/status/{status}", "SUCCEEDED")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void getPaymentsByStatus_asOwner_shouldReturn200() throws Exception {
        String token = loginAndGetToken("i_am_owner@example.com");

        mockMvc.perform(get("/payments/status/{status}", "SUCCEEDED")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void getPaymentsByStatus_invalidStatus_shouldReturn400() throws Exception {
        String token = loginAndGetToken("i_am_manager@example.com");

        mockMvc.perform(get("/payments/status/{status}", "INVALID_STATUS")
                        .header("Authorization", token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Invalid payment status"));
    }

    @Test
    void getPaymentsByStatus_asPremium_shouldReturn403() throws Exception {
        String token = loginAndGetToken("i_am_premium@example.com");

        mockMvc.perform(get("/payments/status/{status}", "SUCCEEDED")
                        .header("Authorization", token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("You don't have permission to access this resource. Required level: Manager"));
    }

    @Test
    void getPaymentsByStatus_unauthorized_shouldReturn401() throws Exception {
        mockMvc.perform(get("/payments/status/{status}", "SUCCEEDED"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }

    // ================ POST /payments/{paymentId}/refund - Manager+ access ================
    @Test
    void processRefund_asManager_shouldReturn200() throws Exception {
        // Mock successful Stripe refund
        Refund mockRefund = new Refund();
        mockRefund.setId("re_test123");
        mockRefund.setAmount(29999L); // $299.99 in cents
        when(stripeUtil.processRefund(anyString(), any(BigDecimal.class)))
            .thenReturn(mockRefund);
            
        Tour tour = createTestTour();
        String token = loginAndGetToken("i_am_manager@example.com");

        Long userId = 1L;
        Booking booking = createTestBooking(userId, tour.getTourId());
        Payment payment = createTestPayment(userId, booking.getBookingId());

        mockMvc.perform(post("/payments/{paymentId}/refund", payment.getPaymentId())
                        .param("refundAmount", "299.99")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));
    }

    @Test
    void processRefund_asOwner_shouldReturn200() throws Exception {
        // Mock successful Stripe refund
        Refund mockRefund = new Refund();
        mockRefund.setId("re_test456");
        mockRefund.setAmount(29999L); // $299.99 in cents
        when(stripeUtil.processRefund(anyString(), any(BigDecimal.class)))
            .thenReturn(mockRefund);
            
        Tour tour = createTestTour();
        String token = loginAndGetToken("i_am_owner@example.com");

        Long userId = 1L;
        Booking booking = createTestBooking(userId, tour.getTourId());
        Payment payment = createTestPayment(userId, booking.getBookingId());

        mockMvc.perform(post("/payments/{paymentId}/refund", payment.getPaymentId())
                        .param("refundAmount", "299.99")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));
    }

    @Test
    void processRefund_invalidAmount_shouldReturn400() throws Exception {
        Tour tour = createTestTour();
        String token = loginAndGetToken("i_am_manager@example.com");

        Long userId = 1L;
        Booking booking = createTestBooking(userId, tour.getTourId());
        Payment payment = createTestPayment(userId, booking.getBookingId());

        // Refund amount exceeds payment amount
        mockMvc.perform(post("/payments/{paymentId}/refund", payment.getPaymentId())
                        .param("refundAmount", "999.99")
                        .header("Authorization", token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Refund amount ($999.99) cannot exceed available refund amount ($599.98). Payment amount: $599.98, Already refunded: $0.00"));
    }

    @Test
    void processRefund_paymentNotFound_shouldReturn404() throws Exception {
        String token = loginAndGetToken("i_am_manager@example.com");

        mockMvc.perform(post("/payments/{paymentId}/refund", 99999L)
                        .param("refundAmount", "100.00")
                        .header("Authorization", token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Payment not found"));
    }

    @Test
    void processRefund_asPremium_shouldReturn403() throws Exception {
        String token = loginAndGetToken("i_am_premium@example.com");

        mockMvc.perform(post("/payments/{paymentId}/refund", 1L)
                        .param("refundAmount", "100.00")
                        .header("Authorization", token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("You don't have permission to access this resource. Required level: Manager"));
    }

    @Test
    void processRefund_unauthorized_shouldReturn401() throws Exception {
        mockMvc.perform(post("/payments/{paymentId}/refund", 1L)
                        .param("refundAmount", "100.00"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }

    @Test
    void processRefund_failedPayment_shouldReturn422() throws Exception {
        Tour tour = createTestTour();
        String token = loginAndGetToken("i_am_manager@example.com");

        Long userId = 1L;
        Booking booking = createTestBooking(userId, tour.getTourId());
        Payment payment = createTestPayment(userId, booking.getBookingId());
        
        // Update payment status to FAILED
        payment.setStatus(Payment.PaymentStatus.FAILED);
        paymentMapper.updatePayment(payment);

        mockMvc.perform(post("/payments/{paymentId}/refund", payment.getPaymentId())
                        .param("refundAmount", "100.00")
                        .header("Authorization", token))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Can only refund succeeded payments. Current status: FAILED"));
    }

    // ================ GET /payments/admin/stats - Manager+ access ================
    @Test
    void getPaymentStats_asManager_shouldReturn200() throws Exception {
        String token = loginAndGetToken("i_am_manager@example.com");

        mockMvc.perform(get("/payments/admin/stats")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data.totalPayments").isNumber())
                .andExpect(jsonPath("$.data.totalRevenue").isNumber());
    }

    @Test
    void getPaymentStats_asOwner_shouldReturn200() throws Exception {
        String token = loginAndGetToken("i_am_owner@example.com");

        mockMvc.perform(get("/payments/admin/stats")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data").isMap());
    }

    @Test
    void getPaymentStats_asPremium_shouldReturn403() throws Exception {
        String token = loginAndGetToken("i_am_premium@example.com");

        mockMvc.perform(get("/payments/admin/stats")
                        .header("Authorization", token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("You don't have permission to access this resource. Required level: Manager"));
    }

    @Test
    void getPaymentStats_unauthorized_shouldReturn401() throws Exception {
        mockMvc.perform(get("/payments/admin/stats"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }

    // Note: 500 Internal Server Error case exists in Swagger for admin/stats but is difficult to test
    // in unit tests as it typically occurs due to database connection issues or calculation errors
}