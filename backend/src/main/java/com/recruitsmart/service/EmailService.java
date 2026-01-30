package com.recruitsmart.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username:jobapplication@recruitsmart.com}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendApplicationSuccessEmail(String toEmail, String jobTitle, String companyName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
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


    public void sendProfileUpdateEmail(String toEmail, String updateDetails) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("RecruitSmart - Profile Updated");
            message.setText(
                "Dear Candidate,\n\n" +
                "This is to inform you that " + updateDetails + "\n\n" +
                "If you did not make this change, please contact support immediately.\n\n" +
                "Best regards,\n" +
                "RecruitSmart Team"
            );
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send profile update email: " + e.getMessage());
        }
    }

    public void sendShortlistedEmail(String toEmail, String jobTitle, String companyName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Congratulations! You've been shortlisted - " + jobTitle);
            message.setText(
                "Dear Candidate,\n\n" +
                "We are pleased to inform you that you have been shortlisted for the " + jobTitle + " position at " + companyName + ".\n\n" +
                "Our team will reach out to you soon regarding the next steps and interview schedule.\n\n" +
                "Best regards,\n" +
                "RecruitSmart Hiring Team"
            );
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send shortlist email: " + e.getMessage());
        }
    }

    public void sendRejectedEmail(String toEmail, String jobTitle, String companyName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Application Update - " + jobTitle);
            message.setText(
                "Dear Candidate,\n\n" +
                "Thank you for your interest in the " + jobTitle + " position at " + companyName + ".\n\n" +
                "After careful review of your application, we regret to inform you that we will not be moving forward with your candidacy at this time.\n\n" +
                "We wish you the best in your job search.\n\n" +
                "Best regards,\n" +
                "RecruitSmart Hiring Team"
            );
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send rejection email: " + e.getMessage());
        }
    }
}
