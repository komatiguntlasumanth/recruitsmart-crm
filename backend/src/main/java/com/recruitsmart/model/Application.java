package com.recruitsmart.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "job_id")
    private Job job;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User student;

    private String status; // APPLIED, REVIEWING, INTERVIEW, REJECTED, HIRED
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
