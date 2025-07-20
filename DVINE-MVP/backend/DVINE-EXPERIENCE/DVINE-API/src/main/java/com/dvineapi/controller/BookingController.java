package com.dvineapi.controller;

import com.dvinedao.annotation.PermissionCheck;
import com.dvinedao.domain.*;
import com.dvineservice.service.BookingService;
import com.stripe.exception.StripeException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for booking operations.
 * Handles tour booking creation, management, and payment integration.
 */
@RestController
@RequestMapping("/bookings")
@Slf4j
public class BookingController {
    
    @Autowired
    private BookingService bookingService;
    
    /**
     * Create a new booking and Stripe payment session
     * Open to all users including guests
     */
    @PostMapping("/create-session")
    @ResponseStatus(HttpStatus.OK)
    public ReturnResult createBookingSession(@RequestBody CreateBookingRequest request) throws StripeException {
        log.info("Creating booking session for tour {} quantity {}", request.getTourId(), request.getQuantity());
        
        BookingSessionResponse response = bookingService.createPaymentSession(request);
        return ReturnResult.success(response);
    }
    
    /**
     * Get booking details by ID
     */
    @GetMapping("/{bookingId}")
    @ResponseStatus(HttpStatus.OK)
    public ReturnResult getBookingDetails(@PathVariable Long bookingId) {
        log.info("Getting booking details for {}", bookingId);
        
        Booking booking = bookingService.getBookingDetails(bookingId);
        return ReturnResult.success(booking);
    }
    
    /**
     * Get booking by reference
     */
    @GetMapping("/reference/{bookingReference}")
    @ResponseStatus(HttpStatus.OK)
    public ReturnResult getBookingByReference(@PathVariable String bookingReference) {
        log.info("Getting booking by reference {}", bookingReference);
        
        Booking booking = bookingService.getBookingByReference(bookingReference);
        return ReturnResult.success(booking);
    }
    
    /**
     * Get all bookings for a user
     */
    @GetMapping("/user/{userId}")
    @ResponseStatus(HttpStatus.OK)
    public ReturnResult getUserBookings(@PathVariable Long userId) {
        log.info("Getting bookings for user {}", userId);
        
        List<Booking> bookings = bookingService.getUserBookings(userId);
        return ReturnResult.success(bookings);
    }
    
    /**
     * Get all bookings for a tour (for tour owners/admins)
     */
    @GetMapping("/tour/{tourId}")
    @ResponseStatus(HttpStatus.OK)
    @PermissionCheck(PermissionLevel.PARTNER)
    public ReturnResult getTourBookings(@PathVariable Long tourId) {
        log.info("Getting bookings for tour {}", tourId);
        
        List<Booking> bookings = bookingService.getTourBookings(tourId);
        return ReturnResult.success(bookings);
    }
    
    /**
     * Get all bookings with details (admin view)
     */
    @GetMapping("/admin/all")
    @ResponseStatus(HttpStatus.OK)
    @PermissionCheck(PermissionLevel.MANAGER)
    public ReturnResult getAllBookingsWithDetails() {
        log.info("Getting all bookings with details");
        
        List<Booking> bookings = bookingService.getAllBookingsWithDetails();
        return ReturnResult.success(bookings);
    }
    
    /**
     * Cancel a booking
     */
    @PostMapping("/{bookingId}/cancel")
    @ResponseStatus(HttpStatus.OK)
    public ReturnResult cancelBooking(@PathVariable Long bookingId) throws StripeException {
        log.info("Cancelling booking {}", bookingId);
        
        bookingService.cancelBooking(bookingId);
        return ReturnResult.success();
    }
}