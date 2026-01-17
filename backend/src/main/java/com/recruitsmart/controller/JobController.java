package com.recruitsmart.controller;

import com.recruitsmart.model.Job;
import com.recruitsmart.repository.JobRepository;
import com.recruitsmart.service.JobRecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class JobController {

    @Autowired
    private JobRepository jobRepository;
    
    @Autowired
    private JobRecommendationService recommendationService;

    @GetMapping
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }
    
    @GetMapping("/open")
    public List<Job> getOpenJobs() {
        return jobRepository.findByStatus("OPEN");
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
        
        return jobRepository.save(job);
    }

    @DeleteMapping("/{id}")
    public void deleteJob(@PathVariable Long id) {
        jobRepository.deleteById(Objects.requireNonNull(id));
    }
}
