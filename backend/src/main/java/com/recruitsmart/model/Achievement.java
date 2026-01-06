package com.recruitsmart.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class Achievement {
    private String title;
    private String description; // e.g., Certificate details

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
