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
        
        String studentLevel = profile.getLevel();
        String studentDesignation = profile.getDesignation();
        
        // Filter jobs by matching level (Status) and Designation (Position)
        List<Job> allJobs = jobRepository.findByStatus("OPEN");
        return allJobs.stream()
            .filter(job -> {
                boolean levelMatch = (studentLevel == null || studentLevel.isEmpty() || 
                                     (job.getLevel() != null && job.getLevel().equalsIgnoreCase(studentLevel)));
                
                boolean designationMatch = (studentDesignation == null || studentDesignation.isEmpty() || 
                                           (job.getDesignation() != null && job.getDesignation().toLowerCase().contains(studentDesignation.toLowerCase())));
                
                return levelMatch && designationMatch;
            })
            .collect(Collectors.toList());
    }
}
