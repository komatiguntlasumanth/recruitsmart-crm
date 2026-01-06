package com.recruitsmart.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class Skill {
    private String name;
    private String type; // Technical, Interpersonal, Interest

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
