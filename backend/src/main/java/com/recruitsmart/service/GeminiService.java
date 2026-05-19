package com.recruitsmart.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
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
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<Double> getEmbedding(String text) {
        if ("YOUR_GEMINI_API_KEY_HERE".equals(apiKey)) {
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
                return mockEmbedding(text);
            }
            
            JsonNode embeddingNode = response.path("embedding").path("values");
            if (embeddingNode.isMissingNode()) {
                return mockEmbedding(text);
            }
            
            List<Double> embedding = new ArrayList<>();
            for (JsonNode val : embeddingNode) {
                embedding.add(val.asDouble());
            }
            return embedding;
        } catch (Exception e) {
            return mockEmbedding(text);
        }
    }

    public void chatStream(String message, String context, List<Map<String, Object>> tools, SseEmitter emitter) {
        if ("YOUR_GEMINI_API_KEY_HERE".equals(apiKey)) {
            streamFallback(message.toLowerCase(), emitter);
            return;
        }

        try {
            String streamUrl = chatUrl.replace("generateContent", "streamGenerateContent") + "?key=" + apiKey;
            URL url = java.net.URI.create(streamUrl).toURL();
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            String prompt = String.format("Context:\n%s\n\nUser Question: %s", context, message);
            Map<String, Object> contentNode = Map.of("role", "user", "parts", List.of(Map.of("text", prompt)));
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(contentNode));
            if (tools != null) {
                requestBody.put("tools", tools);
            }

            String jsonPayload = objectMapper.writeValueAsString(requestBody);
            try (var os = conn.getOutputStream()) {
                os.write(jsonPayload.getBytes(StandardCharsets.UTF_8));
            }

            int status = conn.getResponseCode();
            if (status >= 400) {
                try (BufferedReader errorReader = new BufferedReader(new InputStreamReader(conn.getErrorStream(), StandardCharsets.UTF_8))) {
                    StringBuilder errorMsg = new StringBuilder();
                    String line;
                    while ((line = errorReader.readLine()) != null) {
                        errorMsg.append(line);
                    }
                    throw new RuntimeException("HTTP " + status + ": " + errorMsg.toString());
                }
            }

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                StringBuilder buffer = new StringBuilder();
                while ((line = reader.readLine()) != null) {
                    String trimmed = line.trim();
                    if (trimmed.isEmpty()) continue;
                    
                    // Handle Google's JSON array stream format
                    // Strip the leading "[" or "," and trailing "]" if they are on separate lines
                    if (trimmed.startsWith("[")) trimmed = trimmed.substring(1).trim();
                    if (trimmed.startsWith(",")) trimmed = trimmed.substring(1).trim();
                    if (trimmed.endsWith("]")) trimmed = trimmed.substring(0, trimmed.length() - 1).trim();
                    
                    if (trimmed.isEmpty()) continue;
                    
                    buffer.append(trimmed);
                    
                    try {
                        JsonNode node = objectMapper.readTree(buffer.toString());
                        // If we successfully read a JSON node, it's a valid candidate chunk
                        JsonNode candidates = node.path("candidates");
                        if (candidates.isArray() && candidates.size() > 0) {
                            JsonNode content = candidates.get(0).path("content");
                            JsonNode parts = content.path("parts");
                            if (parts.isArray() && parts.size() > 0) {
                                String text = parts.get(0).path("text").asText();
                                if (!text.isEmpty()) {
                                    // Send the text as-is to preserve spacing
                                    emitter.send(text);
                                }
                            }
                        }
                        buffer.setLength(0); // Clear buffer for next valid chunk
                    } catch (Exception e) {
                        // Incomplete JSON or non-object line, wait for more data
                    }
                }
            }
            emitter.complete();
        } catch (Exception e) {
            try {
                emitter.send("Error during AI streaming: " + e.getMessage());
                emitter.completeWithError(e);
            } catch (Exception ex) {}
        }
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

    public String generateResponse(String prompt) {
        if ("YOUR_GEMINI_API_KEY_HERE".equals(apiKey)) {
            return getFallbackResponse(prompt.toLowerCase());
        }
        return callGemini(List.of(Map.of("parts", List.of(Map.of("text", prompt)))), null);
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
            return null;
        }
    }

    private void streamFallback(String prompt, SseEmitter emitter) {
        String fullText = getFallbackResponse(prompt);
        try {
            // Simulate streaming for demo mode
            String[] words = fullText.split(" ");
            for (String word : words) {
                emitter.send(word + " ");
                Thread.sleep(50);
            }
            emitter.complete();
        } catch (Exception e) {
            emitter.completeWithError(e);
        }
    }

    private String getFallbackResponse(String prompt) {
        if (prompt.contains("help") || prompt.contains("hi") || prompt.contains("hello")) {
            return "### ðŸ‘‹ Hello! I'm the RecruitSmart AI Assistant.\n\n" +
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
        return "I understand you're interested in: '" + prompt + "'.\n\nTo give you a real-time, data-driven answer, I need my 'brain' connected via a **Gemini API Key**. Please update the configuration to proceed!";
    }

    private List<Double> mockEmbedding(String text) {
        List<Double> mock = new ArrayList<>();
        int hash = text.hashCode();
        for (int i = 0; i < 768; i++) {
            mock.add(Math.sin(hash + i));
        }
        return mock;
    }
}
