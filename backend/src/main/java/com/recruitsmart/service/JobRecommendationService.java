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
        
        List<Job> allJobs = jobRepository.findByStatus("OPEN");
        if (allJobs == null || allJobs.isEmpty()) {
            return java.util.Collections.emptyList();
        }

        if (profile == null) {
            return allJobs.stream().limit(5).collect(Collectors.toList());
        }
        
        String studentLevel = profile.getLevel();
        String studentDesignation = profile.getDesignation();
        
        // 1. Try strict level and designation matching
        List<Job> recommended = allJobs.stream()
            .filter(job -> {
                boolean levelMatch = (studentLevel == null || studentLevel.isEmpty() || 
                                     (job.getLevel() != null && job.getLevel().equalsIgnoreCase(studentLevel)));
                
                boolean designationMatch = (studentDesignation != null && !studentDesignation.isEmpty() && 
                                           (job.getDesignation() != null && job.getDesignation().toLowerCase().contains(studentDesignation.toLowerCase())));
                
                return levelMatch && designationMatch;
            })
            .collect(Collectors.toList());
            
        // 2. If empty, try designation matching only (relax level)
        if (recommended.isEmpty() && studentDesignation != null && !studentDesignation.isEmpty()) {
            recommended = allJobs.stream()
                .filter(job -> job.getDesignation() != null && job.getDesignation().toLowerCase().contains(studentDesignation.toLowerCase()))
                .collect(Collectors.toList());
        }
        
        // 3. If still empty, try matching on skills
        if (recommended.isEmpty() && profile.getSkills() != null && !profile.getSkills().isEmpty()) {
            List<String> studentSkills = profile.getSkills().stream()
                .map(s -> s.getName().toLowerCase())
                .collect(Collectors.toList());
            recommended = allJobs.stream()
                .filter(job -> {
                    String jobText = ((job.getTitle() != null ? job.getTitle() : "") + " " +
                                     (job.getDescription() != null ? job.getDescription() : "") + " " +
                                     (job.getEligibilityCriteria() != null ? job.getEligibilityCriteria() : "") + " " +
                                     (job.getDesignation() != null ? job.getDesignation() : "")).toLowerCase();
                    return studentSkills.stream().anyMatch(skill -> jobText.contains(skill));
                })
                .collect(Collectors.toList());
        }
        
        // 4. Ultimate fallback: return first 5 open jobs
        if (recommended.isEmpty()) {
            return allJobs.stream().limit(5).collect(Collectors.toList());
        }
        
        return recommended.stream().limit(5).collect(Collectors.toList());
    }
}
