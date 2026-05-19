import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;

public class TestGemini {
    public static void main(String[] args) {
        try {
            String apiKey = "AIzaSyBQSqWsfbZvTezhw391QTRUZd_FNedyD7s";
            String streamUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=" + apiKey;
            URL url = java.net.URI.create(streamUrl).toURL();
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            String prompt = "Context:\nSome context\n\nUser Question: what is my designation?";
            // Simplest request body
            String jsonPayload = "{\"contents\":[{\"role\":\"user\",\"parts\":[{\"text\":\"" + prompt + "\"}]}]}";
            
            try (var os = conn.getOutputStream()) {
                os.write(jsonPayload.getBytes(StandardCharsets.UTF_8));
            }

            int code = conn.getResponseCode();
            System.out.println("Response Code: " + code);
            if (code >= 400) {
                InputStream errorStream = conn.getErrorStream();
                if (errorStream != null) {
                    try (BufferedReader reader = new BufferedReader(new InputStreamReader(errorStream, StandardCharsets.UTF_8))) {
                        String line;
                        while ((line = reader.readLine()) != null) {
                            System.out.println(line);
                        }
                    }
                }
            } else {
                System.out.println("Success.");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
