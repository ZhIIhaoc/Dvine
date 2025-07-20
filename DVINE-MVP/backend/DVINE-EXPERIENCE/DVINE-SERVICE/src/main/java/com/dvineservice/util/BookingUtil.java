package com.dvineservice.util;

import com.dvinedao.domain.Booking;
import com.dvinedao.domain.CreateBookingRequest;
import com.dvinedao.domain.Tour;
import com.dvinedao.domain.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Utility class for booking-related operations.
 * Contains static methods for booking validation and creation.
 */
@Component
@Slf4j
public class BookingUtil {
    
    /**
     * Validate booking request parameters
     */
    public static void validateBookingRequest(CreateBookingRequest request) {
        if (request.getTourId() == null) {
            throw new IllegalArgumentException("Tour ID is required");
        }
        
        if (!PaymentUtil.isValidQuantity(request.getQuantity())) {
            throw new IllegalArgumentException("Quantity must be between 1 and 10");
        }
        
        if (!PaymentUtil.isValidTravelDate(request.getTravelDate())) {
            throw new IllegalArgumentException("Travel date must be in the future and within 2 years");
        }
    }
    
    /**
     * Create a new booking object from user, tour, and request data
     * Supports both authenticated users and guests (userId can be null)
     */
    public static Booking createBooking(User user, Tour tour, CreateBookingRequest request, 
                                      BigDecimal unitPrice, BigDecimal totalAmount) {
        Booking booking = new Booking();
        booking.setUserId(user.getUserId()); // Can be null for guest users
        booking.setTourId(tour.getTourId());
        booking.setBookingReference(PaymentUtil.generateBookingReference());
        booking.setQuantity(request.getQuantity());
        booking.setUnitPrice(unitPrice);
        booking.setTotalAmount(totalAmount);
        booking.setCurrency("AUD");
        booking.setTravelDate(request.getTravelDate());
        booking.setStatus(Booking.BookingStatus.PENDING);
        booking.setCustomerNotes(request.getCustomerNotes());
        
        return booking;
    }
}