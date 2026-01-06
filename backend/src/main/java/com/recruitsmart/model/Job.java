package com.recruitsmart.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String companyName;
    
    @Column(length = 1000)
    private String description;
    
    private String location;
    private String salary;
    private LocalDate postedDate;
    private String status; // OPEN, CLOSED
    
    @Column(length = 2000)
    private String eligibilityCriteria;
    
    private String applicationLink;
    
    private String jobType; // "JOB" or "TRAINING"

    // PRO TIP: Always add a no-arg constructor for JPA
    public Job() {}

    public Job(String title, String companyName, String description, String location, String salary) {
        this.title = title;
        this.companyName = companyName;
        this.description = description;
        this.location = location;
        this.salary = salary;
        this.postedDate = LocalDate.now();
        this.status = "OPEN";
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getSalary() { return salary; }
    public void setSalary(String salary) { this.salary = salary; }
    public LocalDate getPostedDate() { return postedDate; }
    public void setPostedDate(LocalDate postedDate) { this.postedDate = postedDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getEligibilityCriteria() { return eligibilityCriteria; }
    public void setEligibilityCriteria(String eligibilityCriteria) { this.eligibilityCriteria = eligibilityCriteria; }

    public String getApplicationLink() { return applicationLink; }
    public void setApplicationLink(String applicationLink) { this.applicationLink = applicationLink; }
    
    public String getJobType() { return jobType; }
    public void setJobType(String jobType) { this.jobType = jobType; }
}
