package com.recruitsmart.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class Education {
    private String schoolName;
    private String course; // e.g., 10th, 12th, B.Tech
    private String yearOfPassing;
    private String result; // CGPA or Marks

    // Getters and Setters
    public String getSchoolName() { return schoolName; }
    public void setSchoolName(String schoolName) { this.schoolName = schoolName; }
    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }
    public String getYearOfPassing() { return yearOfPassing; }
    public void setYearOfPassing(String yearOfPassing) { this.yearOfPassing = yearOfPassing; }
    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }
}
