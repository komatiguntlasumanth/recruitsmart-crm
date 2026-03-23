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

    // Ping every 5 minutes (300,000 ms) to keep the service warm
    @Scheduled(fixedRate = 300000)
    public void keepAlive() {
        if (!enabled) {
            logger.debug("Keep-alive is disabled.");
            return;
        }

        if (backendUrl == null || backendUrl.isEmpty()) {
            logger.warn("Keep-alive is enabled but BACKEND_URL is not set. Please set BACKEND_URL in Railway environment variables.");
            return;
        }

        try {
            String url = backendUrl.endsWith("/") ? backendUrl + "health" : backendUrl + "/health";
            logger.info("Railway Keep-Alive: Sending ping to {}", url);
            restTemplate.getForObject(url, String.class);
            logger.info("Railway Keep-Alive: Ping successful âœ…");
        } catch (Exception e) {
            logger.error("Railway Keep-Alive: Ping failed âŒ - Error: {}", e.getMessage());
        }
    }
}
