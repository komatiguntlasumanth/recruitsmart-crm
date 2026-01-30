package com.recruitsmart.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Entity
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Job is required")
    @ManyToOne
    @JoinColumn(name = "job_id")
    private Job job;

    @NotNull(message = "Student is required")
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User student;

    @Pattern(regexp = "^(APPLIED|REVIEWING|INTERVIEW|SHORTLISTED|REJECTED|HIRED)$", message = "Invalid application status")
    private String status; // APPLIED, REVIEWING, INTERVIEW, REJECTED, HIRED
    
    @PastOrPresent(message = "Application date cannot be in the future")
    private LocalDate appliedDate;

    public Application() {}

    public Application(Job job, User student) {
        this.job = job;
        this.student = student;
        this.status = "APPLIED";
        this.appliedDate = LocalDate.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Job getJob() { return job; }
    public void setJob(Job job) { this.job = job; }
    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getAppliedDate() { return appliedDate; }
    public void setAppliedDate(LocalDate appliedDate) { this.appliedDate = appliedDate; }
}
