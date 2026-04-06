package com.recruitsmart.controller;

import com.recruitsmart.model.Job;
import com.recruitsmart.repository.JobRepository;
import com.recruitsmart.service.JobRecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.recruitsmart.repository.ApplicationRepository;
import com.recruitsmart.model.Application;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.HashMap;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class JobController {

    @Autowired
    private JobRepository jobRepository;
    
    @Autowired
    private JobRecommendationService recommendationService;

    @Autowired
    private ApplicationRepository applicationRepository;

    @GetMapping
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }
    
    @GetMapping("/open")
    public List<Job> getOpenJobs() {
        return jobRepository.findByStatus("OPEN");
    }

    @GetMapping("/my-jobs")
    public List<Job> getMyJobs() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return java.util.Collections.emptyList();
        return jobRepository.findByPostedByEmail(auth.getName());
    }

    @GetMapping("/hr-stats")
    public Map<String, Object> getHrStats() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return Map.of();

        String email = auth.getName();
        List<Job> myJobs = jobRepository.findByPostedByEmail(email);
        List<Application> myApps = applicationRepository.findByJobPostedByEmail(email);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalJobs", myJobs.size());
        stats.put("systemTotalJobs", jobRepository.count());
        stats.put("totalApplications", myApps.size());
        stats.put("recentApplicants", myApps); // Return full list for "who are there"
        stats.put("shortlisted", myApps.stream().filter(a -> "SHORTLISTED".equals(a.getStatus())).count());
        stats.put("rejected", myApps.stream().filter(a -> "REJECTED".equals(a.getStatus())).count());
        stats.put("hired", myApps.stream().filter(a -> "HIRED".equals(a.getStatus())).count());

        return stats;
    }

    @PostMapping
    @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
    public Job createJob(@jakarta.validation.Valid @RequestBody Job job) {
        if (job.getStatus() == null) {
            job.setStatus("OPEN");
        }
        if (job.getPostedDate() == null) {
            job.setPostedDate(java.time.LocalDate.now());
        }
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            job.setPostedByEmail(auth.getName());
        }
        
        return jobRepository.save(job);
    }
    
    
    @GetMapping("/recommended/{userId}")
    public List<Job> getRecommendedJobs(@PathVariable Long userId) {
        return recommendationService.getRecommendedJobs(userId);
    }
    
    @GetMapping("/{id}")
    public Job getJobById(@PathVariable Long id) {
        if (id == null) throw new IllegalArgumentException("ID cannot be null");
        return jobRepository.findById(id).orElseThrow(() -> new RuntimeException("Job not found"));
    }

    @PutMapping("/{id}")
    public Job updateJob(@PathVariable Long id, @jakarta.validation.Valid @RequestBody Job jobDetails) {
        Job job = jobRepository.findById(Objects.requireNonNull(id)).orElseThrow(() -> new RuntimeException("Job not found"));
        
        checkPermission(job);
        
        job.setTitle(jobDetails.getTitle());
        job.setCompanyName(jobDetails.getCompanyName());
        job.setDescription(jobDetails.getDescription());
        job.setLocation(jobDetails.getLocation());
        job.setSalary(jobDetails.getSalary());
        job.setDesignation(jobDetails.getDesignation());
        job.setLevel(jobDetails.getLevel());
        job.setApplicationLink(jobDetails.getApplicationLink());
        job.setEligibilityCriteria(jobDetails.getEligibilityCriteria());
        job.setStatus(jobDetails.getStatus());
        job.setStartDate(jobDetails.getStartDate());
        job.setApplicationEndDate(jobDetails.getApplicationEndDate());
        
        return jobRepository.save(job);
    }

    @DeleteMapping("/{id}")
    @org.springframework.transaction.annotation.Transactional
    public void deleteJob(@PathVariable Long id) {
        if (id == null) return;
        jobRepository.findById(id).ifPresent(entity -> {
            checkPermission(entity);
            // Delete associated applications first to avoided FK constraint errors
            applicationRepository.deleteByJobId(id);
            jobRepository.delete(Objects.requireNonNull(entity));
        });
    }
    
    private void checkPermission(Job job) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new RuntimeException("Not authenticated");
        
        String userEmail = auth.getName();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        
        if (isAdmin) return;
        
        if (job.getPostedByEmail() == null) return; // Allow if no owner (legacy)
        
        if (userEmail.equals(job.getPostedByEmail())) return;
        
        // Domain check
        String userDomain = getDomain(userEmail);
        String ownerDomain = getDomain(job.getPostedByEmail());
        
        if (userDomain != null && userDomain.equalsIgnoreCase(ownerDomain)) return;
        
        throw new RuntimeException("You do not have permission to manage this job. Owners of the same domain can manage it.");
    }
    
    private String getDomain(String email) {
        if (email == null || !email.contains("@")) return null;
        return email.substring(email.indexOf("@") + 1);
    }
}
