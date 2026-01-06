package com.recruitsmart.service;

import org.springframework.stereotype.Service;
import java.util.Random;

@Service
public class EmailService {
    private final Random random = new Random();

    /**
     * Mocks sending an email with an OTP code.
     * In a real app, this would use JavaMailSender to send an actual email.
     */
    public void sendOtpEmail(String email, String otp) {
        System.out.println("==================================================");
        System.out.println("MOCK EMAIL SERVICE: Sending OTP to " + email);
        System.out.println("OTP CODE: " + otp);
        System.out.println("==================================================");
    }

    public String generateOtp() {
        return String.format("%06d", random.nextInt(1000000));
    }
}
