import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;

public class TestGeminiModels {
    public static void main(String[] args) {
        try {
            String apiKey = "AIzaSyBQSqWsfbZvTezhw391QTRUZd_FNedyD7s";
            String urlStr = "https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey;
            URL url = java.net.URI.create(urlStr).toURL();
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    System.out.println(line);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
