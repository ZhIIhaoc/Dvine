package com.dvinedao.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to check if the current user can access a booking.
 * This annotation handles the booking permission logic:
 * - Guest bookings (null userId): require Partner+ permission to access
 * - Regular bookings: require ownership OR Partner+ permission to access
 * 
 * The annotation will also check if the booking exists (404 if not found).
 * This annotation can be used on methods to enforce booking access checks.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface BookingOwnerCheck {
}