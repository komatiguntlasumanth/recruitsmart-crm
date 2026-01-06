package com.recruitsmart.controller;

import com.recruitsmart.model.Application;
import com.recruitsmart.model.Job;
import com.recruitsmart.model.User;
import com.recruitsmart.repository.ApplicationRepository;
import com.recruitsmart.repository.JobRepository;
import com.recruitsmart.repository.UserRepository;
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

    @PostMapping("/apply/{jobId}")
    public Application applyForJob(@PathVariable Long jobId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User student = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
        
        Application application = new Application(job, student);
        return applicationRepository.save(application);
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
        Application app = applicationRepository.findById(id).orElseThrow(() -> new RuntimeException("Application not found"));
        app.setStatus(statusMap.get("status"));
        return applicationRepository.save(app);
    }
}
