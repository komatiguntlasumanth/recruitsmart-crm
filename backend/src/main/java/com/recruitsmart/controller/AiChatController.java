package com.recruitsmart.controller;

import com.recruitsmart.repository.ApplicationRepository;
import com.recruitsmart.repository.StudentProfileRepository;
import com.recruitsmart.repository.UserRepository;
import com.recruitsmart.service.GeminiService;
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
    private GeminiService geminiService;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.recruitsmart.repository.JobRepository jobRepository;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request, Principal principal) {
        String message = request.get("message");
        
        StringBuilder contextBuilder = new StringBuilder();
        contextBuilder.append("System: You are the RecruitSmart AI Assistant, a helpful and professional recruiter companion. ");
        contextBuilder.append("Use the following real-time data to answer user queries accurately. ");
        contextBuilder.append("If you don't know something, be honest. Always format your responses using Markdown for readability.\n\n");
        
        // Add Job Content
        List<com.recruitsmart.model.Job> activeJobs = jobRepository.findAll();
        if (activeJobs != null && !activeJobs.isEmpty()) {
            contextBuilder.append("### Available Jobs:\n");
            activeJobs.stream().limit(10).forEach(job -> {
                contextBuilder.append("- ").append(job.getTitle())
                        .append(" at ").append(job.getCompanyName())
                        .append(" (").append(job.getLocation()).append(")\n");
            });
            contextBuilder.append("\n");
        }

        if (principal != null) {
            String email = principal.getName();
            userRepository.findByEmail(email).ifPresent(user -> {
                contextBuilder.append("### User Info:\n");
                contextBuilder.append("- Name: ").append(user.getUsername()).append("\n");
                
                studentProfileRepository.findByUser(user).ifPresent(profile -> {
                    contextBuilder.append("- Designation: ").append(profile.getDesignation() != null ? profile.getDesignation() : "Not specified").append("\n");
                    contextBuilder.append("- Experience: ").append(profile.getYearsOfExperience()).append(" years\n");
                    if (profile.getSkills() != null && !profile.getSkills().isEmpty()) {
                        contextBuilder.append("- Skills: ");
                        String skills = profile.getSkills().stream().map(s -> s.getName()).collect(Collectors.joining(", "));
                        contextBuilder.append(skills).append("\n");
                    }
                    if (profile.getProfileSummary() != null) {
                        contextBuilder.append("- Summary: ").append(profile.getProfileSummary()).append("\n");
                    }
                });

                List<com.recruitsmart.model.Application> apps = applicationRepository.findByStudent(user);
                if (apps != null && !apps.isEmpty()) {
                    contextBuilder.append("\n### User's Current Applications:\n");
                    for (com.recruitsmart.model.Application a : apps) {
                        contextBuilder.append("- ").append(a.getJob().getTitle())
                                .append(": Status is **").append(a.getStatus()).append("**\n");
                    }
                }
            });
        }

        String context = contextBuilder.toString();
        String prompt = String.format("Context:\n%s\n\nUser Question: %s\n\nAssistant:", context, message);
        String response = geminiService.generateResponse(prompt);
        
        return ResponseEntity.ok(Map.of("response", response));
    }
}
