package com.recruitsmart.controller;

import com.recruitsmart.model.User;
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

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request, Principal principal) {
        String message = request.get("message");
        
        StringBuilder contextBuilder = new StringBuilder("You are the RecruitSmart AI Assistant. ");
        
        if (principal != null) {
            String email = principal.getName();
            userRepository.findByEmail(email).ifPresent(user -> {
                contextBuilder.append("The current user is: ").append(user.getUsername()).append(". ");
                
                studentProfileRepository.findByUser(user).ifPresent(profile -> {
                    contextBuilder.append("User's Designation: ").append(profile.getDesignation()).append(". ");
                    if (profile.getSkills() != null && !profile.getSkills().isEmpty()) {
                        contextBuilder.append("Skills: ");
                        for (int i = 0; i < profile.getSkills().size(); i++) {
                            contextBuilder.append(profile.getSkills().get(i).getName());
                            if (i < profile.getSkills().size() - 1) contextBuilder.append(", ");
                        }
                        contextBuilder.append(". ");
                    }
                });

                List<com.recruitsmart.model.Application> apps = applicationRepository.findByStudent(user);
                if (apps != null && !apps.isEmpty()) {
                    contextBuilder.append("User's Applications: ");
                    for (int i = 0; i < apps.size(); i++) {
                        com.recruitsmart.model.Application a = apps.get(i);
                        contextBuilder.append(a.getJob().getTitle()).append(" (").append(a.getStatus()).append(")");
                        if (i < apps.size() - 1) contextBuilder.append(", ");
                    }
                    contextBuilder.append(". ");
                }
            });
        }

        String context = contextBuilder.toString();
        String prompt = String.format("Context: %s\n\nUser Question: %s\n\nAssistant:", context, message);
        String response = geminiService.generateResponse(prompt);
        
        return ResponseEntity.ok(Map.of("response", response));
    }
}
