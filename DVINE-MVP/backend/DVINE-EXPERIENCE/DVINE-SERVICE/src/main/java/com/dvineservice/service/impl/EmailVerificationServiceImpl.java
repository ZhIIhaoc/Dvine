package com.dvineservice.service.impl;

import com.dvineservice.service.EmailVerificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.ses.SesClient;
import software.amazon.awssdk.services.ses.model.*;

import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;

@Service
public class EmailVerificationServiceImpl implements EmailVerificationService {
    
    private static final Logger log = LoggerFactory.getLogger(EmailVerificationServiceImpl.class);
    private static final String VERIFICATION_CODE_PREFIX = "email_verification:";
    private static final SecureRandom random = new SecureRandom();
    
    @Autowired
    private SesClient sesClient;
    
    @Autowired
    private StringRedisTemplate stringRedisTemplate;
    
    @Value("${aws.ses.from-email}")
    private String fromEmail;
    
    @Value("${email.verification.code-length}")
    private int codeLength;
    
    @Value("${email.verification.expiration-minutes}")
    private int expirationMinutes;
    
    @Override
    public boolean sendVerificationCode(String email) {
        try {
            // generate verification code
            String verificationCode = generateVerificationCode();
            
            // save verification code to Redis
            String redisKey = VERIFICATION_CODE_PREFIX + email;
            stringRedisTemplate.opsForValue().set(redisKey, verificationCode, expirationMinutes, TimeUnit.MINUTES);
            
            // send verification code email
            sendEmail(email, verificationCode);
            
            log.info("Verification code sent successfully to email: {}", email);
            return true;
        } catch (Exception e) {
            log.error("Failed to send verification code to email: {}", email, e);
            return false;
        }
    }
    
    @Override
    public boolean verifyCode(String email, String code) {
        try {
            String redisKey = VERIFICATION_CODE_PREFIX + email;
            String storedCode = stringRedisTemplate.opsForValue().get(redisKey);
            
            if (storedCode != null && storedCode.equals(code)) {
                log.info("Email verification successful: {}", email);
                return true;
            } else {
                log.warn("Email verification failed: {} - Invalid or expired code", email);
                return false;
            }
        } catch (Exception e) {
            log.error("Error verifying code for email: {}", email, e);
            return false;
        }
    }
    
    @Override
    public void removeVerificationCode(String email) {
        try {
            String redisKey = VERIFICATION_CODE_PREFIX + email;
            stringRedisTemplate.delete(redisKey);
            log.info("Verification code removed for email: {}", email);
        } catch (Exception e) {
            log.error("Error removing verification code for email: {}", email, e);
        }
    }

    private String generateVerificationCode() {
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < codeLength; i++) {
            code.append(random.nextInt(10));
        }
        return code.toString();
    }

    private void sendEmail(String toEmail, String verificationCode) {
        String subject = "DVINE - Email Verification Code";
        String htmlBody = buildEmailContent(verificationCode);
        String textBody = "Your verification code is: " + verificationCode + ". This code will expire in " + expirationMinutes + " minutes.";
        
        try {
            SendEmailRequest request = SendEmailRequest.builder()
                    .source(fromEmail)
                    .destination(Destination.builder().toAddresses(toEmail).build())
                    .message(Message.builder()
                            .subject(Content.builder().data(subject).build())
                            .body(Body.builder()
                                    .html(Content.builder().data(htmlBody).build())
                                    .text(Content.builder().data(textBody).build())
                                    .build())
                            .build())
                    .build();
            
            SendEmailResponse response = sesClient.sendEmail(request);
            log.info("Email sent successfully. Message ID: {}", response.messageId());
        } catch (Exception e) {
            log.error("Failed to send email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send verification email", e);
        }
    }

    private String buildEmailContent(String verificationCode) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<title>Email Verification</title>" +
                "</head>" +
                "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>" +
                "<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>" +
                "<h2 style='color: #2c3e50; text-align: center;'>DVINE Email Verification</h2>" +
                "<div style='background-color: #f8f9fa; padding: 20px; border-radius: 5px; text-align: center;'>" +
                "<p style='font-size: 16px; margin-bottom: 20px;'>Your verification code is:</p>" +
                "<div style='font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px; margin: 20px 0;'>" +
                verificationCode +
                "</div>" +
                "<p style='font-size: 14px; color: #6c757d;'>This code will expire in " + expirationMinutes + " minutes.</p>" +
                "</div>" +
                "<p style='font-size: 14px; color: #6c757d; text-align: center; margin-top: 20px;'>" +
                "If you didn't request this verification code, please ignore this email." +
                "</p>" +
                "</div>" +
                "</body>" +
                "</html>";
    }
}