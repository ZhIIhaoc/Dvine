package com.dvineservice.service;

import com.dvinedao.domain.Booking;
import com.dvinedao.domain.BookingSessionResponse;
import com.dvinedao.domain.CreateBookingRequest;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;

import java.util.List;

/**
 * Service interface for booking operations.
 * Handles tour booking creation, management, and payment integration.
 */
public interface BookingService {
    
    /**
     * Create a new booking and Stripe payment session
     */
    BookingSessionResponse createPaymentSession(CreateBookingRequest request) throws StripeException;
    
    /**
     * Get booking details by ID with permission checking
     */
    Booking getBookingDetails(Long bookingId);
    
    /**
     * Get all bookings for a user
     */
    List<Booking> getUserBookings(Long userId);
    
    /**
     * Get all bookings for a tour (for tour owners/admins)
     */
    List<Booking> getTourBookings(Long tourId);
    
    /**
     * Cancel a booking with business rule validation
     */
    void cancelBooking(Long bookingId) throws StripeException;
    
    /**
     * Confirm booking after successful payment
     */
    void confirmBooking(Long bookingId, Session stripeSession);
    
    /**
     * Find booking by reference
     */
    Booking getBookingByReference(String bookingReference);
    
    /**
     * Get all bookings with details (admin view)
     */
    List<Booking> getAllBookingsWithDetails();
    
    /**
     * Update booking status
     */
    void updateBookingStatus(Long bookingId, Booking.BookingStatus status);
}