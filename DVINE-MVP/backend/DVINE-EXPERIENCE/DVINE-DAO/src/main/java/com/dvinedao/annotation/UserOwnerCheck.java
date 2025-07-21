package com.dvinedao.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to check if the current user can access data for a specific userId.
 * This annotation handles the user ownership logic:
 * - Users can only access their own data OR have Partner+ permission to access any data
 * 
 * The annotation will check userId parameter in the method arguments.
 * This annotation can be used on methods to enforce user ownership checks.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface UserOwnerCheck {
}