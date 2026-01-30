package com.recruitsmart.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String chatUrl;

    @Value("${gemini.embedding.url}")
    private String embeddingUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public List<Double> getEmbedding(String text) {
        if ("YOUR_GEMINI_API_KEY_HERE".equals(apiKey)) {
            // Return mock embedding if no key is provided
            return mockEmbedding(text);
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> content = new HashMap<>();
            content.put("parts", List.of(Map.of("text", text)));
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "models/text-embedding-004");
            requestBody.put("content", content);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            String urlWithKey = embeddingUrl + "?key=" + apiKey;

            JsonNode response = restTemplate.postForObject(urlWithKey, entity, JsonNode.class);
            if (response == null || response.isMissingNode()) {
                System.err.println("Gemini Embedding Error: Empty response");
                return mockEmbedding(text);
            }
            
            JsonNode embeddingNode = response.path("embedding").path("values");
            if (embeddingNode.isMissingNode()) {
                System.err.println("Gemini Embedding Error: Values not found in response");
                return mockEmbedding(text);
            }
            
            List<Double> embedding = new ArrayList<>();
            for (JsonNode val : embeddingNode) {
                embedding.add(val.asDouble());
            }
            return embedding;
        } catch (Exception e) {
            System.err.println("Gemini Embedding Error: " + e.getMessage());
            return mockEmbedding(text);
        }
    }

    public String generateResponse(String prompt) {
        if ("YOUR_GEMINI_API_KEY_HERE".equals(apiKey)) {
            return getFallbackResponse(prompt.toLowerCase());
        }
        return callGemini(List.of(Map.of("parts", List.of(Map.of("text", prompt)))), null);
    }

    public JsonNode generateWithTools(String message, String context, List<Map<String, Object>> tools) {
        if ("YOUR_GEMINI_API_KEY_HERE".equals(apiKey)) return null;

        String prompt = String.format("Context:\n%s\n\nUser Question: %s", context, message);
        Map<String, Object> content = Map.of("role", "user", "parts", List.of(Map.of("text", prompt)));
        
        return postToGemini(List.of(content), tools);
    }

    public String generateFinalResponse(String message, String context, String functionName, String toolResult) {
        if ("YOUR_GEMINI_API_KEY_HERE".equals(apiKey)) return toolResult;

        String prompt = String.format("Context:\n%s\n\nUser asked: %s\n\nTool '%s' returned: %s\n\nPlease explain this result to the user naturally.", 
            context, message, functionName, toolResult);
        
        return generateResponse(prompt);
    }

    private String callGemini(List<Map<String, Object>> contents, List<Map<String, Object>> tools) {
        JsonNode response = postToGemini(contents, tools);
        if (response != null && response.has("candidates")) {
            JsonNode candidate = response.path("candidates").get(0);
            return candidate.path("content").path("parts").get(0).path("text").asText();
        }
        return "Error: Could not get a response from AI.";
    }

    private JsonNode postToGemini(List<Map<String, Object>> contents, List<Map<String, Object>> tools) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", contents);
            if (tools != null) {
                requestBody.put("tools", tools);
            }

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            String urlWithKey = chatUrl + "?key=" + apiKey;

            return restTemplate.postForObject(urlWithKey, entity, JsonNode.class);
        } catch (Exception e) {
            System.err.println("Gemini API Error: " + e.getMessage());
            return null;
        }
    }

    private String getFallbackResponse(String prompt) {
        if (prompt.contains("help") || prompt.contains("hi") || prompt.contains("hello")) {
            return "### Hello! I'm the RecruitSmart AI Assistant.\n\n" +
                   "I'm currently running in **demo mode**. I've analyzed your profile and I am ready to help you with:\n" +
                   "- **Job Recommendations** based on your skills.\n" +
                   "- **Application Tracking** status updates.\n" +
                   "- **Profile Analysis** to improve your transparency to HR.\n\n" +
                   "> [!NOTE]\n" +
                   "> To unlock full intelligence with live data processing, please provide a valid **Google Gemini API Key** in `application.properties`.";
        }
        if (prompt.contains("job") || prompt.contains("career")) {
            return "Based on our current database, we have several active positions in Technology and Management. " +
                   "You can view them in the **Jobs** tab. Once you add your Gemini API Key, I can tell you exactly which ones match your skills!";
        }
        if (prompt.contains("status") || prompt.contains("apply")) {
            return "You can track your application status in the **My Applications** section. Each application shows if it's 'Pending', 'Reviewed', or 'Shortlisted'.";
        }
        if (prompt.contains("hr") || prompt.contains("manager")) {
            return "The HR team uses our ML models to see your profile's 'Fit Score'. Make sure your skills and experience are fully updated in your profile!";
        }
        return "I understand you're interested in: '" + prompt + "'.\n\nTo give you a real-time, data-driven answer, I need my 'brain' connected via a **Gemini API Key**. Please update the configuration to proceed!";
    }

    private List<Double> mockEmbedding(String text) {
        // Simple mock: hash-based stable fake embedding for demonstration without key
        List<Double> mock = new ArrayList<>();
        int hash = text.hashCode();
        for (int i = 0; i < 768; i++) {
            mock.add(Math.sin(hash + i));
        }
        return mock;
    }
}
