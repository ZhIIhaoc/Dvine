package com.dvineservice.service;

public interface EmailVerificationService {
    boolean sendVerificationCode(String email);
    boolean verifyCode(String email, String code);
    void removeVerificationCode(String email);
}