package com.recruitsmart.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.recruitsmart.model.Application;
import com.recruitsmart.model.Job;
import com.recruitsmart.model.StudentProfile;
import com.recruitsmart.model.User;
import com.recruitsmart.repository.ApplicationRepository;
import com.recruitsmart.repository.JobRepository;
import com.recruitsmart.repository.StudentProfileRepository;
import com.recruitsmart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AgenticService {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    public String processChat(String message, String userEmail, String context) {
        // Step 1: Define Tools
        List<Map<String, Object>> tools = List.of(
            Map.of("function_declarations", List.of(
                Map.of(
                    "name", "apply_for_job",
                    "description", "Apply for a specific job opening using its Job ID.",
                    "parameters", Map.of(
                        "type", "OBJECT",
                        "properties", Map.of(
                            "jobId", Map.of("type", "number", "description", "The unique ID of the job to apply for.")
                        ),
                        "required", List.of("jobId")
                    )
                ),
                Map.of(
                    "name", "update_profile_summary",
                    "description", "Update the student's professional profile summary or bio.",
                    "parameters", Map.of(
                        "type", "OBJECT",
                        "properties", Map.of(
                            "summary", Map.of("type", "string", "description", "The new professional summary text.")
                        ),
                        "required", List.of("summary")
                    )
                )
            ))
        );

        // Step 2: Call Gemini with Tools
        JsonNode aiResponse = geminiService.generateWithTools(message, context, tools);

        if (aiResponse == null) return "I'm sorry, I couldn't process that request right now.";

        // Step 3: Check for Function Call
        JsonNode candidate = aiResponse.path("candidates").get(0);
        JsonNode part = candidate.path("content").path("parts").get(0);

        if (part.has("functionCall")) {
            String functionName = part.path("functionCall").path("name").asText();
            JsonNode args = part.path("functionCall").path("args");

            String result;
            if ("apply_for_job".equals(functionName)) {
                Long jobId = args.has("jobId") ? args.path("jobId").asLong() : null;
                result = handleApplyForJob(jobId, userEmail);
            } else if ("update_profile_summary".equals(functionName)) {
                result = handleUpdateSummary(args.path("summary").asText(), userEmail);
            } else {
                result = "Error: Unknown function requested.";
            }

            // Step 4: Send tool result back to Gemini for final natural language response
            return geminiService.generateFinalResponse(message, context, functionName, result);
        }

        // Return simple text response if no function call
        return part.path("text").asText();
    }

    @Transactional
    public String handleApplyForJob(Long jobId, String email) {
        try {
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
            if (jobId == null) return "FAIL: Missing Job ID.";
            Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));

            if (applicationRepository.existsByJobIdAndStudentId(jobId, user.getId())) {
                return "FAIL: User has already applied for this job.";
            }

            Application app = new Application(job, user);
            applicationRepository.save(app);
            
            try {
                emailService.sendApplicationSuccessEmail(email, job.getTitle(), job.getCompanyName());
            } catch (Exception e) {}

            return "SUCCESS: User has successfully applied for " + job.getTitle() + " at " + job.getCompanyName() + ".";
        } catch (Exception e) {
            return "FAIL: " + e.getMessage();
        }
    }

    @Transactional
    public String handleUpdateSummary(String summary, String email) {
        try {
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
            StudentProfile profile = studentProfileRepository.findByUser(user).orElseThrow(() -> new RuntimeException("Profile not found"));
            
            profile.setProfileSummary(summary);
            studentProfileRepository.save(profile);
            
            return "SUCCESS: Profile summary has been updated to: " + summary;
        } catch (Exception e) {
            return "FAIL: " + e.getMessage();
        }
    }
}
