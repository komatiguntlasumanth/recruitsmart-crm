package com.recruitsmart.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username:noreply@recruitsmart.com}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendApplicationSuccessEmail(String toEmail, String jobTitle, String companyName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Application Submitted Successfully - " + jobTitle);
            message.setText(
                "Dear Candidate,\n\n" +
                "Your application for " + jobTitle + " at " + companyName + " has been successfully submitted through RecruitSmart.\n\n" +
                "Our team will review your application and get back to you soon.\n\n" +
                "Thank you for using RecruitSmart - Your gateway to the future!\n\n" +
                "Best regards,\n" +
                "The RecruitSmart Team"
            );
            mailSender.send(message);
        } catch (Exception e) {
            // Log error but don't fail the application submission
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }
}
