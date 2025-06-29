package com.dvinedao.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to check if the current user is the owner of the catalogue.
 * This annotation will also check 404 if the catalogue exists.
 * This annotation can be used on methods to enforce ownership checks.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface CatalogueOwnerCheck {
}
