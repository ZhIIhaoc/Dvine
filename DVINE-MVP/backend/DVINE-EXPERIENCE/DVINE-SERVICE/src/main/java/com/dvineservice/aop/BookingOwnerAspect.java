package com.dvineservice.aop;

import com.dvinedao.domain.Booking;
import com.dvinedao.domain.PermissionLevel;
import com.dvinedao.domain.User;
import com.dvinedao.mapper.BookingMapper;
import com.dvineservice.exception.BookingNotFoundException;
import com.dvineservice.exception.PermissionDeniedException;
import com.dvineservice.util.UserUtil;
import com.dvineservice.util.ValidationUtil;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Order(30) // Ensure this aspect runs after PermissionCheckAspect and TourOwnerAspect
@Aspect
@Component
@Slf4j
public class BookingOwnerAspect {
    
    @Autowired
    private BookingMapper bookingMapper;

    /** runs *before* any method annotated with @BookingOwnerCheck */
    @Before("@annotation(com.dvinedao.annotation.BookingOwnerCheck)")
    public void verifyBookingAccess(JoinPoint jp) {
        MethodSignature signature = (MethodSignature) jp.getSignature();
        String[] parameterNames = signature.getParameterNames();
        Object[] args = jp.getArgs();

        Long bookingId = extractBookingId(args, parameterNames);
        if (bookingId == null) {
            throw new IllegalStateException(
                    "@BookingOwnerCheck target must supply a bookingId parameter");
        }

        // Fetch booking from database
        Booking booking = bookingMapper.findById(bookingId);
        if (booking == null) {
            throw new BookingNotFoundException("Booking not found");
        }

        // Get current user
        User currentUser = UserUtil.getCurrentUser();
        
        // Apply booking permission logic
        validateBookingAccess(booking, currentUser);
        
        log.debug("Booking access validated for bookingId: {} by user: {}", 
                  bookingId, currentUser.getUserId());
    }

    /**
     * Validates if the current user can access the booking based on business rules:
     * - Guest bookings (null userId): require Partner+ permission to access
     * - Regular bookings: require ownership OR Partner+ permission to access
     */
    private void validateBookingAccess(Booking booking, User currentUser) {
        // Guest bookings (null userId) can only be accessed by partners or higher
        if (booking.getUserId() == null) {
            if (currentUser.getPermission() < PermissionLevel.PARTNER) {
                throw new PermissionDeniedException("Guest bookings can only be accessed by partners or higher");
            }
        } else {
            // Regular user booking - check ownership or partner access
            if (!booking.getUserId().equals(currentUser.getUserId()) && 
                currentUser.getPermission() < PermissionLevel.PARTNER) {
                throw new PermissionDeniedException("You can only view your own bookings");
            }
        }
    }

    /**
     * Try to locate a booking-id inside the arguments of the intercepted method.
     * Supported shapes:
     *   • Long with parameter name "bookingId"    → returns the value
     *   • Booking entity                          → returns entity.getBookingId()
     *
     * @return the id or {@code null} if none of the parameters contains it
     */
    private Long extractBookingId(Object[] args, String[] paramNames) {
        if (args == null) {
            return null;
        }

        for (int i = 0; i < args.length && i < paramNames.length; i++) {
            Object arg = args[i];
            String paramName = paramNames[i];

            // 1) direct Long id with specific parameter name
            if (arg instanceof Long bookingId && "bookingId".equals(paramName)) {
                return bookingId;
            }

            // 2) Booking entity
            if (arg instanceof Booking booking) {
                if (booking.getBookingId() != null) {
                    return booking.getBookingId();
                }
            }

            if (arg instanceof String bookingReference && "bookingReference".equals(paramName)) {
                // Validate booking reference format first
                ValidationUtil.validateBookingReferenceFormat(bookingReference);
                
                // If we have a booking reference, we can look it up
                Booking booking = bookingMapper.findByReference(bookingReference);
                if (booking != null) {
                    return booking.getBookingId();
                } else {
                    throw new BookingNotFoundException("Booking not found for reference: " + bookingReference);
                }
            }
        }

        return null;        // not found ➞ caller will throw IllegalStateException
    }
}