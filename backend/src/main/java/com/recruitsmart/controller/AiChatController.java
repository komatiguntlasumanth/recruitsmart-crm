package com.recruitsmart.controller;

import com.recruitsmart.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiChatController {

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        String context = request.getOrDefault("context", "You are the RecruitSmart AI Assistant.");
        
        String prompt = String.format("Context: %s\n\nUser Question: %s\n\nAssistant:", context, message);
        String response = geminiService.generateResponse(prompt);
        
        return ResponseEntity.ok(Map.of("response", response));
    }
}
