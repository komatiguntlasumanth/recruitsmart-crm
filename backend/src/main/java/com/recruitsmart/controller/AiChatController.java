package com.recruitsmart.controller;

import com.recruitsmart.repository.JobRepository;
import com.recruitsmart.repository.ApplicationRepository;
import com.recruitsmart.repository.StudentProfileRepository;
import com.recruitsmart.repository.UserRepository;
import com.recruitsmart.service.AgenticService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiChatController {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AgenticService agenticService;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request, Principal principal) {
        String message = request.get("message");
        String email = (principal != null) ? principal.getName() : "anonymous";
        
        StringBuilder contextBuilder = new StringBuilder();
        contextBuilder.append("System: You are the RecruitSmart Agentic Assistant. ");
        contextBuilder.append("You have the power to help users APPLY for jobs and UPDATE their profiles. ");
        contextBuilder.append("When a user expresses interest in a job, use the Job ID provided below to call the 'apply_for_job' tool. ");
        contextBuilder.append("Always format your responses using Markdown.\n\n");
        
        // Add Job Content with IDs
        List<com.recruitsmart.model.Job> activeJobs = jobRepository.findAll();
        if (activeJobs != null && !activeJobs.isEmpty()) {
            contextBuilder.append("### Available Jobs (Real-time):\n");
            activeJobs.stream().limit(10).forEach(job -> {
                contextBuilder.append("- ").append(job.getTitle())
                        .append(" at ").append(job.getCompanyName())
                        .append(" [ID: ").append(job.getId()).append("] (").append(job.getLocation()).append(")\n");
            });
            contextBuilder.append("\n");
        }

        if (principal != null) {
            userRepository.findByEmail(email).ifPresent(user -> {
                contextBuilder.append("### User Info:\n");
                contextBuilder.append("- Name: ").append(user.getUsername()).append("\n");
                
                studentProfileRepository.findByUser(user).ifPresent(profile -> {
                    contextBuilder.append("- Current Designation: ").append(profile.getDesignation() != null ? profile.getDesignation() : "Not specified").append("\n");
                    if (profile.getSkills() != null && !profile.getSkills().isEmpty()) {
                        String skills = profile.getSkills().stream().map(s -> s.getName()).collect(Collectors.joining(", "));
                        contextBuilder.append("- Skills: ").append(skills).append("\n");
                    }
                    contextBuilder.append("- Profile Summary: ").append(profile.getProfileSummary() != null ? profile.getProfileSummary() : "None").append("\n");
                });

                List<com.recruitsmart.model.Application> apps = applicationRepository.findByStudent(user);
                if (apps != null && !apps.isEmpty()) {
                    contextBuilder.append("\n### User's Current Applications:\n");
                    for (com.recruitsmart.model.Application a : apps) {
                        contextBuilder.append("- ").append(a.getJob().getTitle()).append(" (Status: ").append(a.getStatus()).append(")\n");
                    }
                }
            });
        }

        String response = agenticService.processChat(message, email, contextBuilder.toString());
        
        return ResponseEntity.ok(Map.of("response", response));
    }
}
