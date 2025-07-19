package com.dvinedao.domain;

public class RegisterWithVerificationRequest {
    private User user;
    private String verificationCode;
    
    public RegisterWithVerificationRequest() {}
    
    public RegisterWithVerificationRequest(User user, String verificationCode) {
        this.user = user;
        this.verificationCode = verificationCode;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public String getVerificationCode() {
        return verificationCode;
    }
    
    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
    }
    
    @Override
    public String toString() {
        return "RegisterWithVerificationRequest{" +
                "user=" + user +
                ", verificationCode='" + verificationCode + '\'' +
                '}';
    }
}