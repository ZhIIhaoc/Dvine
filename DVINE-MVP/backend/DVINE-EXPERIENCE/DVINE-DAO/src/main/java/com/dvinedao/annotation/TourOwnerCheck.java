package com.dvinedao.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to check if the current user is the owner of the tour.
 * This annotation will also check 404 if the tour exists.
 * This annotation can be used on methods to enforce tour ownership checks.
 * For Partners: only allows modification of tours they created
 * For Managers+: allows modification of any tour (administrative override)
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface TourOwnerCheck {
}