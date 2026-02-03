package com.recruitsmart.controller;

import com.recruitsmart.repository.JobRepository;
import com.recruitsmart.repository.ApplicationRepository;
import com.recruitsmart.repository.StudentProfileRepository;
import com.recruitsmart.repository.UserRepository;
import com.recruitsmart.service.AgenticService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

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

    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chat(@RequestBody Map<String, String> request, Principal principal) {
        String message = request.get("message");
        String email = (principal != null) ? principal.getName() : "anonymous";
        
        StringBuilder contextBuilder = new StringBuilder();
        contextBuilder.append("System: You are the RecruitSmart AI, a helpful career assistant inspired by Google's Gemini. ");
        contextBuilder.append("Your goal is to help users find jobs, track applications, and improve their profiles. ");
        contextBuilder.append("Be friendly, professional, and concise. Always use Markdown for formatting. ");
        contextBuilder.append("If you need to perform an action like applying for a job, use the specific tool available.\n\n");
        
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
                contextBuilder.append("### User Profile:\n");
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

        SseEmitter emitter = new SseEmitter(60000L); // 1 minute timeout
        agenticService.processChatStream(message, email, contextBuilder.toString(), emitter);
        
        return emitter;
    }
}
