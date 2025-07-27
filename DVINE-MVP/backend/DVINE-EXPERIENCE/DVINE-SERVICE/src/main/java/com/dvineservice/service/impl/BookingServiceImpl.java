package com.dvineservice.service.impl;

import com.dvinedao.annotation.BookingOwnerCheck;
import com.dvinedao.annotation.PermissionCheck;
import com.dvinedao.annotation.UserOwnerCheck;
import com.dvinedao.domain.*;
import com.dvinedao.mapper.BookingMapper;
import com.dvinedao.mapper.PaymentMapper;
import com.dvinedao.mapper.UserMapper;
import com.dvineservice.exception.BookingNotFoundException;
import com.dvineservice.exception.InvalidBookingStatusException;
import com.dvineservice.exception.NotFoundException;
import com.dvineservice.service.BookingService;
import com.dvineservice.service.PaymentService;
import com.dvineservice.service.TourService;
import com.dvineservice.util.BookingUtil;
import com.dvineservice.util.PaymentUtil;
import com.dvineservice.util.StripeUtil;
import com.dvineservice.util.UserUtil;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Implementation of BookingService for tour booking operations.
 */
@Service
@Transactional
@Slf4j
public class BookingServiceImpl implements BookingService {
    
    @Autowired
    private BookingMapper bookingMapper;
    
    @Autowired
    private PaymentMapper paymentMapper;
    
    @Autowired
    private TourService tourService;
    
    @Autowired
    private StripeUtil stripeUtil;
    
    @Autowired
    private PaymentService paymentService;
    @Autowired
    private UserMapper userMapper;

    @Override
    @Transactional
    public BookingSessionResponse createBookingPaymentSession(CreateBookingRequest request) throws StripeException {
        log.info("Creating payment session for tour {} quantity {}", request.getTourId(), request.getQuantity());
        
        // 1. Validate input
        BookingUtil.validateBookingRequest(request);
        
        // 2. Get tour and user
        Tour tour = tourService.findById(request.getTourId());
        User user = UserUtil.getCurrentUser();
        
        // 3. Determine price based on user permission
        BigDecimal unitPrice = PaymentUtil.determineUserPrice(tour, user);
        BigDecimal totalAmount = PaymentUtil.calculateTotalAmount(request.getQuantity(), unitPrice);
        
        // 4. Create booking record
        Booking booking = BookingUtil.createBooking(user, tour, request, unitPrice, totalAmount);
        bookingMapper.createBooking(booking);
        
        // 5. Create Stripe session
        Session stripeSession = stripeUtil.createBookingCheckoutSession(booking, tour, unitPrice);
        
        // 6. Create payment record with session ID included (no update needed)
        Payment payment = PaymentUtil.createPayment(booking);
        payment.setStripeSessionId(stripeSession.getId());
        paymentMapper.createPayment(payment);
        
        log.info("Created booking {} with session {}", booking.getBookingId(), stripeSession.getId());
        
        return new BookingSessionResponse(
            booking.getBookingId(),
            booking.getBookingReference(),
            stripeSession.getUrl()
        );
    }
    
    @Override
//    @BookingOwnerCheck
    public Booking getBookingDetails(Long bookingId) {
        Booking booking = bookingMapper.findById(bookingId);
        if (booking == null) {
            log.error("Booking not found: {}", bookingId);
            throw new BookingNotFoundException("Booking not found");
        }
        return booking;
    }

    @Override
    @BookingOwnerCheck
    public Booking getBookingByReference(String bookingReference) {
        // Apply booking owner check using the booking ID
        return bookingMapper.findByReference(bookingReference);
    }
    
    @Override
    @UserOwnerCheck
    public List<Booking> getUserBookings(Long userId) {
        if (userMapper.findUserById(userId) == null) {
            log.error("User not found");
            throw new NotFoundException("User not found");
        }
        return bookingMapper.findByUserId(userId);
    }
    
    @Override
    public List<Booking> getTourBookings(Long tourId) {
        if (tourService.findById(tourId) == null) {
            log.error("Tour not found)");
            throw new NotFoundException("Tour not found");
        }
        return bookingMapper.findByTourId(tourId);
    }

    @Override
    public List<Booking> getAllBookingsWithDetails() {
        return bookingMapper.findBookingsWithDetails();
    }

    @Transactional
    @Override
    @BookingOwnerCheck
    public void cancelBooking(Long bookingId) throws StripeException {
        Booking booking = getBookingDetails(bookingId); // Includes permission check
        
        // Business rule validation
        if (!PaymentUtil.isCancellationAllowed(booking.getTravelDate())) {
            throw new InvalidBookingStatusException("Booking cannot be cancelled within 48 hours of travel date");
        }
        
        if (booking.getStatus() != Booking.BookingStatus.CONFIRMED && 
            booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new InvalidBookingStatusException("Only confirmed or pending bookings can be cancelled");
        }
        
        // Update booking status
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        bookingMapper.updateBooking(booking);
        
        // If payment was successful, process refund
        Payment payment = paymentMapper.findByBookingId(bookingId);
        if (payment != null && payment.getStatus() == Payment.PaymentStatus.SUCCEEDED) {
            // Process full refund for cancelled booking - exceptions handled by global exception handler
            paymentService.processRefund(payment.getPaymentId(), payment.getAmount());
            log.info("Successfully processed refund for cancelled booking {} - payment {}", 
                     bookingId, payment.getPaymentId());
        }
        
        log.info("Cancelled booking {}", bookingId);
    }

    @Override
    public void confirmBooking(Long bookingId, Session stripeSession) {
        Booking booking = bookingMapper.findById(bookingId);
        if (booking == null) {
            throw new BookingNotFoundException("Booking not found: " + bookingId);
        }

        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        bookingMapper.updateBooking(booking);

        log.info("Confirmed booking {} via Stripe session {}", bookingId, stripeSession.getId());
    }
    
    @Override
    public void updateBookingStatus(Long bookingId, Booking.BookingStatus status) {
        Booking booking = bookingMapper.findById(bookingId);
        if (booking == null) {
            throw new BookingNotFoundException("Booking not found: " + bookingId);
        }
        
        booking.setStatus(status);
        bookingMapper.updateBooking(booking);
        
        log.info("Updated booking {} status to {}", bookingId, status);
    }
    
}