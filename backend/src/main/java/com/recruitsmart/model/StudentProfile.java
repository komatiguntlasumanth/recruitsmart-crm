package com.recruitsmart.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "student_profiles")
public class StudentProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    // Contact & Basic Info
    private String dob;
    private String mobileNumber;
    private String alternateEmail;
    private String alternateMobile;
    private String currentLocation;
    private String permanentAddress;

    // Professional Info
    private String designation; // "Fresher", "Experienced", "Management" (from dropdown)
    private String workStatus; // "Student", "Working Professional", etc.
    private int yearsOfExperience;
    
    // Social Links
    private String githubLink;
    private String linkedinLink;
    private String portfolioUrl; 

    
    @Lob // Large object for long text
    private String profileSummary;
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String profilePictureUrl;
    
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String resumeUrl;

    @ElementCollection
    private List<Education> education = new ArrayList<>();

    @ElementCollection
    private List<Experience> experiences = new ArrayList<>();

    @ElementCollection
    private List<Project> projects = new ArrayList<>();

    @ElementCollection
    private List<Skill> skills = new ArrayList<>();

    @ElementCollection
    private List<Achievement> achievements = new ArrayList<>();
    
    @ElementCollection
    private List<Experience> internships = new ArrayList<>(); // Reusing Experience model for internships
    
    @ElementCollection
    private List<Project> certificates = new ArrayList<>(); // Reusing Project model for Certificates (title, description, link)

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }
    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
    public String getAlternateEmail() { return alternateEmail; }
    public void setAlternateEmail(String alternateEmail) { this.alternateEmail = alternateEmail; }
    public String getAlternateMobile() { return alternateMobile; }
    public void setAlternateMobile(String alternateMobile) { this.alternateMobile = alternateMobile; }
    public String getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(String currentLocation) { this.currentLocation = currentLocation; }
    public String getPermanentAddress() { return permanentAddress; }
    public void setPermanentAddress(String permanentAddress) { this.permanentAddress = permanentAddress; }
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    public int getYearsOfExperience() { return yearsOfExperience; }
    public void setYearsOfExperience(int yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }
    public String getPortfolioUrl() { return portfolioUrl; }
    public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }
    public String getProfileSummary() { return profileSummary; }
    public void setProfileSummary(String profileSummary) { this.profileSummary = profileSummary; }
    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
    public List<Education> getEducation() { return education; }
    public void setEducation(List<Education> education) { this.education = education; }
    public List<Experience> getExperiences() { return experiences; }
    public void setExperiences(List<Experience> experiences) { this.experiences = experiences; }
    public List<Project> getProjects() { return projects; }
    public void setProjects(List<Project> projects) { this.projects = projects; }
    public List<Skill> getSkills() { return skills; }
    public void setSkills(List<Skill> skills) { this.skills = skills; }
    public List<Achievement> getAchievements() { return achievements; }
    public void setAchievements(List<Achievement> achievements) { this.achievements = achievements; }
    
    public String getWorkStatus() { return workStatus; }
    public void setWorkStatus(String workStatus) { this.workStatus = workStatus; }
    public String getGithubLink() { return githubLink; }
    public void setGithubLink(String githubLink) { this.githubLink = githubLink; }
    public String getLinkedinLink() { return linkedinLink; }
    public void setLinkedinLink(String linkedinLink) { this.linkedinLink = linkedinLink; }
    
    public List<Experience> getInternships() { return internships; }
    public void setInternships(List<Experience> internships) { this.internships = internships; }
    public List<Project> getCertificates() { return certificates; }
    public void setCertificates(List<Project> certificates) { this.certificates = certificates; }
    
    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }
}
