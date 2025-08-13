package com.dvinedao.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to check if the current user can access a payment.
 * This annotation handles the payment permission logic through booking ownership:
 * - Guest bookings (null userId): require Manager+ permission to access payments
 * - Regular bookings: require ownership OR Partner+ permission to access payments
 * 
 * The annotation will also check if the payment exists (404 if not found).
 * This annotation can be used on methods to enforce payment access checks.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface PaymentOwnerCheck {
}