package com.dvinedao.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;


/**
 * Annotation to check if the current user has admin permissions.
 * This can be used on methods to enforce admin-only access.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface AdminPermissionCheck {
}
