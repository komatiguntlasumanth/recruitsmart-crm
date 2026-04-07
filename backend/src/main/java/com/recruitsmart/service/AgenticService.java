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
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

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

    @Autowired
    private JobRecommendationService jobRecommendationService;

    public void processChatStream(String message, String userEmail, String context, List<Map<String, Object>> history, SseEmitter emitter) {
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
                ),
                Map.of(
                    "name", "get_recommended_jobs",
                    "description", "Get a list of recommended jobs for the current user based on their profile.",
                    "parameters", Map.of(
                        "type", "OBJECT",
                        "properties", Map.of(),
                        "required", List.of()
                    )
                )
            ))
        );

        // For streaming, we first check for function calls with a sync call if tools are present
        // Or we can just stream directly if we don't expect immediate function calls
        // Gemini 1.5 prefers distinct calls for function calling vs streaming text
        
        // Simple approach: try to get function call first
        JsonNode aiResponse = geminiService.generateWithTools(message, context, tools);
        
        if (aiResponse == null) {
            // Fallback to demo mode streaming
            geminiService.chatStream(message, context, null, emitter);
            return;
        }

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
            } else if ("get_recommended_jobs".equals(functionName)) {
                result = handleGetRecommendations(userEmail);
            } else {
                result = "Error: Unknown function requested.";
            }

            // Stream the final explanation
            String finalPrompt = String.format("Context:\n%s\n\nUser asked: %s\n\nTool '%s' returned: %s\n\nPlease explain this result to the user naturally.", 
                    context, message, functionName, result);
            geminiService.chatStream(finalPrompt, "", null, emitter);
        } else {
            // No function call, just stream the text response
            geminiService.chatStream(message, context, null, emitter);
        }
    }
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
                ),
                Map.of(
                    "name", "get_recommended_jobs",
                    "description", "Get a list of recommended jobs for the current user based on their profile.",
                    "parameters", Map.of(
                        "type", "OBJECT",
                        "properties", Map.of(),
                        "required", List.of()
                    )
                )
            ))
        );

        // Step 2: Call Gemini with Tools
        JsonNode aiResponse = geminiService.generateWithTools(message, context, tools);

        if (aiResponse == null) {
            String lowerMsg = message.toLowerCase();
            if (lowerMsg.contains("job") || lowerMsg.contains("find")) {
                return "### ðŸ” Searching for Jobs (Demo Mode)\n\n" +
                       "I'm currently in Demo Mode because no API key is set, but I can see you're interested in jobs! \n\n" +
                       "Based on the system status, there are **" + jobRepository.count() + "** active openings. " +
                       "You can view them all in the **Jobs** tab. Once a Gemini API key is configured, I can personally recommend the best fits for your skills.";
            } else if (lowerMsg.contains("status") || lowerMsg.contains("application")) {
                return "### ðŸ“Š Application Status (Demo Mode)\n\n" +
                       "I see you're checking on your applications. \n\n" +
                       "In this demo mode, I can confirm that your current applications are being tracked in the **My Applications** section. " +
                       "There, you'll find the real-time status (e.g., 'Applied', 'Reviewed') for each role.";
            } else if (lowerMsg.contains("help") || lowerMsg.contains("hi") || lowerMsg.contains("hello")) {
                return "### ðŸ‘‹ Hello! I'm the RecruitSmart AI\n\n" +
                       "I'm currently running in **demo mode**. I've analyzed your profile and I am ready to help you with:\n\n" +
                       "- **Exploring Jobs**: I can find the latest openings for you.\n" +
                       "- **Tracking Applications**: I can help you monitor your progress.\n" +
                       "- **Profile Tips**: I can suggest improvements to your resume.\n\n" +
                       "> [!NOTE]\n" +
                       "> To unlock full intelligence and automatic job applications, please provide a **Gemini API Key** in `application.properties`.";
            }
            
            return "### ðŸ¤– RecruitSmart AI (Demo Mode)\n\n" +
                   "I understand you're asking about: *\"" + message + "\"*. \n\n" +
                   "While my 'brain' (Gemini API) isn't connected yet, I can tell you that RecruitSmart is designed to streamline your career journey. " +
                   "Try asking me about **'jobs'** or **'application status'**!";
        }

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
            } else if ("get_recommended_jobs".equals(functionName)) {
                result = handleGetRecommendations(userEmail);
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

    private String handleGetRecommendations(String email) {
        try {
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) return "FAIL: User not found.";

            List<Job> jobs = jobRecommendationService.getRecommendedJobs(user.getId());
            if (jobs.isEmpty()) return "No specific recommendations found. Please try updating your profile skills.";

            StringBuilder sb = new StringBuilder("Here are some recommended jobs for you:\n");
            for (Job job : jobs) {
                sb.append("- ").append(job.getTitle()).append(" at ").append(job.getCompanyName())
                  .append(" (ID: ").append(job.getId()).append(")\n");
            }
            return sb.toString();
        } catch (Exception e) {
            return "FAIL: " + e.getMessage();
        }
    }
}
