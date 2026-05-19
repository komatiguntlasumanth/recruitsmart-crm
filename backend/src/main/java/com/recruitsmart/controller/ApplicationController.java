
package com.recruitsmart.controller;

import com.recruitsmart.model.Application;
import com.recruitsmart.model.Job;
import com.recruitsmart.model.User;
import com.recruitsmart.repository.ApplicationRepository;
import com.recruitsmart.repository.JobRepository;
import com.recruitsmart.repository.UserRepository;
import com.recruitsmart.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*")
public class ApplicationController {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmailService emailService;

    @Autowired
    private com.recruitsmart.service.NotificationService notificationService;

    @PostMapping("/apply/{jobId}")
    public Application applyForJob(@PathVariable Long jobId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User student = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        if (jobId == null) throw new IllegalArgumentException("Job ID cannot be null");
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job find error"));
        
        // Check if student already applied to this job
        if (applicationRepository.existsByJobIdAndStudentId(jobId, student.getId())) {
            throw new RuntimeException("your mail already applied to this job");
        }
        
        Application application = new Application(job, student);
        Application saved = applicationRepository.save(application);
        
        // Send email notification
        try {
            emailService.sendApplicationSuccessEmail(student.getEmail(), job.getTitle(), job.getCompanyName());
            notificationService.createNotification(student, "You successfully applied for " + job.getTitle() + " at " + job.getCompanyName(), "APPLICATION");
        } catch(Exception e) {
            // Log but don't fail the application
            System.err.println("Failed to send application notification: " + e.getMessage());
        }
        
        return saved;
    }

    @GetMapping("/all")
    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }

    @GetMapping("/my")
    public List<Application> getMyApplications() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User student = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return applicationRepository.findByStudent(student);
    }
    
    @GetMapping("/job/{jobId}")
    public List<Application> getApplicationsForJob(@PathVariable Long jobId) {
        return applicationRepository.findByJobId(jobId);
    }
    
    @PutMapping("/{id}/status")
    public Application updateStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> statusMap) {
        if (id == null) throw new IllegalArgumentException("ID cannot be null");
        Application app = applicationRepository.findById(id).orElseThrow(() -> new RuntimeException("Application find error"));
        String oldStatus = app.getStatus();
        String newStatus = statusMap.get("status");
        app.setStatus(newStatus);
        Application saved = applicationRepository.save(app);
        
        // Trigger emails if status changed
        if (newStatus != null && !newStatus.equalsIgnoreCase(oldStatus)) {
            try {
                if (newStatus.equalsIgnoreCase("SHORTLISTED") || newStatus.equalsIgnoreCase("INTERVIEW") || newStatus.equalsIgnoreCase("HIRED")) {
                    emailService.sendShortlistedEmail(app.getStudent().getEmail(), app.getJob().getTitle(), app.getJob().getCompanyName());
                } else if (newStatus.equalsIgnoreCase("REJECTED")) {
                    emailService.sendRejectedEmail(app.getStudent().getEmail(), app.getJob().getTitle(), app.getJob().getCompanyName());
                }
                notificationService.createNotification(app.getStudent(), "Your application for " + app.getJob().getTitle() + " status updated to: " + newStatus, "APPLICATION");
            } catch (Exception e) {
                System.err.println("Failed to send status update notification: " + e.getMessage());
            }
        }
        return saved;
    }

    @PutMapping("/bulk-status")
    public List<Application> updateBulkStatus(@RequestBody java.util.Map<String, Object> payload) {
        @SuppressWarnings("unchecked")
        List<Integer> ids = (List<Integer>) payload.get("ids");
        String status = (String) payload.get("status");
        
        if (ids == null || status == null) throw new IllegalArgumentException("IDs and status are required");

        java.util.List<Long> longIds = new java.util.ArrayList<>();
        for (Integer id : ids) {
            longIds.add(id.longValue());
        }

        java.util.Objects.requireNonNull(longIds, "IDs list cannot be null");
        List<Application> apps = (List<Application>) applicationRepository.findAllById(longIds);
        apps.forEach(app -> {
            app.setStatus(status);
            try {
                if (status.equalsIgnoreCase("SHORTLISTED") || status.equalsIgnoreCase("INTERVIEW") || status.equalsIgnoreCase("HIRED")) {
                    emailService.sendShortlistedEmail(app.getStudent().getEmail(), app.getJob().getTitle(), app.getJob().getCompanyName());
                } else if (status.equalsIgnoreCase("REJECTED")) {
                    emailService.sendRejectedEmail(app.getStudent().getEmail(), app.getJob().getTitle(), app.getJob().getCompanyName());
                }
                notificationService.createNotification(app.getStudent(), "Bulk Update: Your application for " + app.getJob().getTitle() + " status updated to: " + status, "APPLICATION");
            } catch (Exception e) {
                System.err.println("Failed to send bulk status update notification: " + e.getMessage());
            }
        });
        return applicationRepository.saveAll(apps);
    }
}
