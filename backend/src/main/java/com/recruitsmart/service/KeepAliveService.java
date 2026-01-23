package com.recruitsmart.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class KeepAliveService {
    private static final Logger logger = LoggerFactory.getLogger(KeepAliveService.class);
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.keep-alive.enabled:false}")
    private boolean enabled;

    @Value("${BACKEND_URL:}")
    private String backendUrl;

    // Ping every 10 minutes (600,000 ms)
    @Scheduled(fixedRate = 600000)
    public void keepAlive() {
        if (!enabled) {
            return;
        }

        if (backendUrl == null || backendUrl.isEmpty()) {
            logger.warn("Keep-alive is enabled but BACKEND_URL is not set. Please set BACKEND_URL in environment variables.");
            return;
        }

        try {
            String url = backendUrl.endsWith("/") ? backendUrl + "health" : backendUrl + "/health";
            logger.info("Sending keep-alive ping to: {}", url);
            restTemplate.getForObject(url, String.class);
            logger.info("Keep-alive ping successful.");
        } catch (Exception e) {
            logger.error("Keep-alive ping failed: {}", e.getMessage());
        }
    }
}
