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
            JsonNode embeddingNode = response.path("embedding").path("values");
            
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

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);

            Map<String, Object> content = new HashMap<>();
            content.put("parts", List.of(textPart));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(content));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            String urlWithKey = chatUrl + "?key=" + apiKey;

            JsonNode response = restTemplate.postForObject(urlWithKey, entity, JsonNode.class);
            return response.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
        } catch (Exception e) {
            return "Error calling Gemini API: " + e.getMessage();
        }
    }

    private String getFallbackResponse(String prompt) {
        if (prompt.contains("help") || prompt.contains("hi") || prompt.contains("hello")) {
            return "Hello! I'm the RecruitSmart Assistant. I can help you find jobs, rank candidates, or answer questions about the recruitment process. (Note: Real-time Gemini LLM features require an API key in application.properties).";
        }
        if (prompt.contains("job") || prompt.contains("career")) {
            return "You can browse open positions in the 'Jobs' tab. Our AI matching system will highlight roles that fit your skills best!";
        }
        if (prompt.contains("status") || prompt.contains("apply")) {
            return "You can track your application status in the 'My Applications' section. Once you apply, our HR team (formerly Managers) will review your profile.";
        }
        if (prompt.contains("hr") || prompt.contains("manager")) {
            return "The HR team uses RecruitSmart to streamline hiring. They can see your ML conversion score, which is calculated based on your profile strength!";
        }
        return "That's an interesting question! I'm currently running in demo mode. To get an intelligent LLM response for: '" + prompt + "', please provide a valid Google Gemini API key in application.properties.";
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
