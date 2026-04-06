package com.recruitsmart.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Entity
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Job title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;
    
    @NotBlank(message = "Company name is required")
    @Size(max = 200, message = "Company name must not exceed 200 characters")
    private String companyName;
    
    @NotBlank(message = "Job description is required")
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    @Column(length = 1000)
    private String description;
    
    @NotBlank(message = "Location is required")
    private String location;
    
    private String salary;
    
    private LocalDate postedDate;
    
    @Pattern(regexp = "^(OPEN|CLOSED)$", message = "Status must be either OPEN or CLOSED")
    private String status; // OPEN, CLOSED
    
    @Column(length = 2000)
    private String eligibilityCriteria;
    
    private String applicationLink;
    
    @Pattern(regexp = "^(JOB|TRAINING)$", message = "Job type must be either JOB or TRAINING")
    private String jobType; // "JOB" or "TRAINING"
    
    private String designation; // Role Title (e.g. Software Engineer)
    
    @Pattern(regexp = "^(Fresher|Experienced|Management)$", message = "Level must be Fresher, Experienced, or Management")
    private String level; // "Fresher", "Experienced", "Management" (Status in UI)

    private LocalDate startDate;
    private LocalDate applicationEndDate;
    private String postedByEmail;

    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<Application> applications = new java.util.ArrayList<>();

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
    
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getApplicationEndDate() { return applicationEndDate; }
    public void setApplicationEndDate(LocalDate applicationEndDate) { this.applicationEndDate = applicationEndDate; }

    public String getPostedByEmail() { return postedByEmail; }
    public void setPostedByEmail(String postedByEmail) { this.postedByEmail = postedByEmail; }
}
