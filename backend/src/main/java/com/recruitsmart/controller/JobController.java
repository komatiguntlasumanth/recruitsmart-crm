package com.recruitsmart.controller;

import com.recruitsmart.model.Job;
import com.recruitsmart.repository.JobRepository;
import com.recruitsmart.service.JobRecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

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
    public Job createJob(@RequestBody Job job) {
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
        return jobRepository.findById(id).orElseThrow(() -> new RuntimeException("Job not found"));
    }
}
