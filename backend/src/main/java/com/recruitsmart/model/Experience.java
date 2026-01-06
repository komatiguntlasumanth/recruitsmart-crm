package com.recruitsmart.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class Experience {
    private String companyName;
    private String designation;
    private String duration; // e.g., "2 years" or date range
    private String description;

    // Getters and Setters
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
