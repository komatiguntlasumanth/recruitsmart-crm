package com.recruitsmart.service;

import com.recruitsmart.model.Job;
import com.recruitsmart.model.StudentProfile;
import com.recruitsmart.repository.JobRepository;
import com.recruitsmart.repository.StudentProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobRecommendationService {

    @Autowired
    private JobRepository jobRepository;
    
    @Autowired
    private StudentProfileRepository studentProfileRepository;

    public List<Job> getRecommendedJobs(Long userId) {
        // Get student profile
        StudentProfile profile = studentProfileRepository.findByUserId(userId).orElse(null);
        
        if (profile == null || profile.getDesignation() == null || profile.getDesignation().isEmpty()) {
            // No profile or designation set - return all open jobs
            return jobRepository.findByStatus("OPEN");
        }
        
        String studentDesignation = profile.getDesignation();
        
        // Filter jobs by matching designation
        List<Job> allJobs = jobRepository.findByStatus("OPEN");
        return allJobs.stream()
            .filter(job -> job.getDesignation() != null && job.getDesignation().equals(studentDesignation))
            .collect(Collectors.toList());
    }
}
