package com.dvinedao.mapper;

import com.dvinedao.domain.Booking;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * MyBatis mapper for booking operations.
 */
@Mapper
public interface BookingMapper {
    
    /**
     * Create a new booking
     */
    void createBooking(Booking booking);
    
    /**
     * Find booking by ID
     */
    Booking findById(@Param("bookingId") Long bookingId);
    
    /**
     * Find booking by reference
     */
    Booking findByReference(@Param("bookingReference") String bookingReference);
    
    /**
     * Find all bookings for a user
     */
    List<Booking> findByUserId(@Param("userId") Long userId);
    
    /**
     * Find all bookings for a tour
     */
    List<Booking> findByTourId(@Param("tourId") Long tourId);
    
    /**
     * Update booking details
     */
    void updateBooking(Booking booking);
    
    /**
     * Find bookings with tour and user details (for admin views)
     */
    List<Booking> findBookingsWithDetails();
    
    /**
     * Count bookings by status
     */
    Integer countByStatus(@Param("status") String status);
}