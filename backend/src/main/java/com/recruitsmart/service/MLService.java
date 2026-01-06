package com.recruitsmart.service;

import com.recruitsmart.model.Lead;
import org.springframework.stereotype.Service;
import java.util.Random;

@Service
public class MLService {
    private final Random random = new Random();

    /**
     * Simulates an ML algorithm that scores a lead based on internal features.
     * In a real version, this might use a regression model (e.g., Logistic Regression)
     * trained on historical conversion data.
     */
    public Double calculateLeadScore(Lead lead) {
        // Mocking ML logic: Higher score for certain sources or company types
        double baseScore = 0.5;
        
        if ("Referral".equalsIgnoreCase(lead.getSource())) baseScore += 0.2;
        if (lead.getCompany() != null && lead.getCompany().contains("Tech")) baseScore += 0.15;
        
        // Adding a bit of "stochastic" nature to simulate model variance
        double variance = (random.nextDouble() - 0.5) * 0.1;
        
        return Math.min(1.0, Math.max(0.0, baseScore + variance));
    }

    /**
     * Predicts suitability for a student matching an opportunity.
     */
    public Double predictMatchingScore(String studentSkills, String jobRequirements) {
        // Implement a basic string similarity matching to simulate NLP-based ML
        return 0.85; // Mocked high match
    }
}
