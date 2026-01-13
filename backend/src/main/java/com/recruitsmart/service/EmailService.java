package com.recruitsmart.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username:jobapplication@recuritsmart.com}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendApplicationSuccessEmail(String toEmail, String jobTitle, String companyName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("jobapplication@recuritsmart.com");
            message.setTo(toEmail);
            message.setSubject("Job Application Received - " + jobTitle);
            message.setText(
                "Dear Candidate,\n\n" +
                "Your job application for " + jobTitle + " at " + companyName + " was received successfully through RecruitSmart.\n\n" +
                "Our team will review your application and get back to you soon.\n\n" +
                "Thank you for using RecruitSmart!\n\n" +
                "Best regards,\n" +
                "RecruitSmart Team"
            );
            mailSender.send(message);
        } catch (Exception e) {
            // Log error but don't fail the application submission
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }
}
