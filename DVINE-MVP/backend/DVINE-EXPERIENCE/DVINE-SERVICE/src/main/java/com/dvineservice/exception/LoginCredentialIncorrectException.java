package com.dvineservice.exception;

public class LoginCredentialIncorrectException extends RuntimeException {
    public LoginCredentialIncorrectException(String message) {
        super(message);
    }
}
