package com.dvineservice.aop;

import com.dvinedao.domain.Booking;
import com.dvinedao.domain.Payment;
import com.dvinedao.domain.PermissionLevel;
import com.dvinedao.domain.User;
import com.dvinedao.mapper.BookingMapper;
import com.dvinedao.mapper.PaymentMapper;
import com.dvineservice.exception.NotFoundException;
import com.dvineservice.exception.PaymentFailedException;
import com.dvineservice.exception.PermissionDeniedException;
import com.dvineservice.util.UserUtil;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Order(35) // Run after UserOwnerAspect (25) and BookingOwnerAspect (30)
@Aspect
@Component
@Slf4j
public class PaymentOwnerAspect {

    @Autowired
    private PaymentMapper paymentMapper;
    
    @Autowired
    private BookingMapper bookingMapper;

    @Before("@annotation(com.dvinedao.annotation.PaymentOwnerCheck)")
    public void verifyPaymentOwnership(JoinPoint jp) {
        MethodSignature signature = (MethodSignature) jp.getSignature();
        String[] parameterNames = signature.getParameterNames();
        Object[] args = jp.getArgs();

        Long paymentId = extractPaymentId(args, parameterNames);
        if (paymentId == null) {
            throw new IllegalStateException(
                    "@PaymentOwnerCheck target must supply a paymentId parameter");
        }

        // Fetch payment from database
        Payment payment = paymentMapper.findById(paymentId);
        if (payment == null) {
            throw new PaymentFailedException("Payment not found");
        }

        // Get current user
        User currentUser = UserUtil.getCurrentUser();
        
        // Apply payment permission logic through booking ownership
        validatePaymentAccess(payment, currentUser);
        
        log.debug("Payment access validated for paymentId: {} by user: {}", 
                  paymentId, currentUser.getUserId());
    }

    /**
     * Try to locate a payment-id inside the arguments of the intercepted method.
     * Supported shapes:
     *   • Long with parameter name "paymentId"    → returns the value
     *
     * @return the id or {@code null} if none of the parameters contains it
     */
    private Long extractPaymentId(Object[] args, String[] paramNames) {
        if (args == null) {
            return null;
        }

        for (int i = 0; i < args.length && i < paramNames.length; i++) {
            Object arg = args[i];
            String paramName = paramNames[i];

            // Direct Long id with specific parameter name
            if (arg instanceof Long paymentId && "paymentId".equals(paramName)) {
                if (paymentMapper.findById(paymentId) == null) {
                    throw new NotFoundException("Payment not found");
                }
                return paymentId;
            } else if (arg instanceof Long bookingId && "bookingId".equals(paramName)) {
                // If we find a bookingId, we can look up the payment by bookingId
                Payment payment = paymentMapper.findByBookingId(bookingId);
                if (payment != null) {
                    return payment.getPaymentId();  // return the payment ID
                } else {
                    throw new NotFoundException("Payment not found");
                }
            }
        }

        return null;        // not found ➞ caller will throw IllegalStateException
    }

    /**
     * Validate payment access through booking ownership
     */
    private void validatePaymentAccess(Payment payment, User currentUser) {
        // Get the booking to check user ownership
        if (payment.getBookingId() != null) {
            validateBookingAccess(payment, currentUser);
        }

    }

    private void validateBookingAccess(Payment payment, User currentUser) {
        Booking booking = bookingMapper.findById(payment.getBookingId());
        if (booking == null) {
            throw new PaymentFailedException("Associated booking not found");
        }

        // Guest bookings (userId is null) can only be accessed by paid partner and above
        if (booking.getUserId() == null) {
            if (!PermissionLevel.hasAdminPrivileges(currentUser.getPermission())) {
                throw new PermissionDeniedException("Guest booking payments can only be accessed by paid partners and above");
            }
            return;
        }

        // Regular user bookings - users can only access their own payments OR have admin privileges
        if (!booking.getUserId().equals(currentUser.getUserId()) &&
            !PermissionLevel.hasAdminPrivileges(currentUser.getPermission())) {
            throw new PermissionDeniedException("You can only access your own payment details");
        }
    }
}