package com.recruitsmart.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class Document {
    private String name;
    private String type; // e.g. "PDF", "Image"
    private String size;
    private String date;
    private String content; // base64 content if stored directly, otherwise a URL

    // Default constructor
    public Document() {}

    public Document(String name, String type, String size, String date, String content) {
        this.name = name;
        this.type = type;
        this.size = size;
        this.date = date;
        this.content = content;
    }

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
