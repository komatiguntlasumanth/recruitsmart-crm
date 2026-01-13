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
        } catch(Exception e) {
            // Log but don't fail the application
            System.err.println("Failed to send application email: " + e.getMessage());
        }
        
        return saved;
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
        app.setStatus(statusMap.get("status"));
        return applicationRepository.save(app);
    }
}
