package com.recruitsmart.controller;

import com.recruitsmart.model.StudentProfile;
import com.recruitsmart.model.User;
import com.recruitsmart.repository.StudentProfileRepository;
import com.recruitsmart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;


@RestController
@RequestMapping("/api/student/profile")
public class StudentProfileController {

    @Autowired
    private StudentProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public StudentProfile getProfile(Principal principal) {
        String email = principal.getName(); // In our case, username is email
        return profileRepository.findByUserEmail(email)
                .orElseGet(() -> new StudentProfile()); // Return empty if new
    }

    @PostMapping
    public StudentProfile updateProfile(@RequestBody StudentProfile profile, Principal principal) {
        System.out.println("Updating profile for: " + principal.getName());
        String email = principal.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Find existing or create new
        StudentProfile existingInfo = profileRepository.findByUser(user).orElse(new StudentProfile());
        
        // Update fields
        existingInfo.setUser(user);
        existingInfo.setDob(profile.getDob());
        existingInfo.setMobileNumber(profile.getMobileNumber());
        existingInfo.setAlternateEmail(profile.getAlternateEmail());
        existingInfo.setAlternateMobile(profile.getAlternateMobile());
        existingInfo.setCurrentLocation(profile.getCurrentLocation());
        existingInfo.setPermanentAddress(profile.getPermanentAddress());
        existingInfo.setDesignation(profile.getDesignation());
        existingInfo.setYearsOfExperience(profile.getYearsOfExperience());
        existingInfo.setPortfolioUrl(profile.getPortfolioUrl());
        existingInfo.setProfileSummary(profile.getProfileSummary());
        existingInfo.setProfilePictureUrl(profile.getProfilePictureUrl());
        
        // Update Collections - Use clear/addAll for Hibernate managed collections
        if (profile.getEducation() != null) {
            existingInfo.getEducation().clear();
            existingInfo.getEducation().addAll(profile.getEducation());
        }
        if (profile.getExperiences() != null) {
            existingInfo.getExperiences().clear();
            existingInfo.getExperiences().addAll(profile.getExperiences());
        }
        if (profile.getProjects() != null) {
            existingInfo.getProjects().clear();
            existingInfo.getProjects().addAll(profile.getProjects());
        }
        if (profile.getSkills() != null) {
            existingInfo.getSkills().clear();
            existingInfo.getSkills().addAll(profile.getSkills());
        }
        if (profile.getAchievements() != null) {
            existingInfo.getAchievements().clear();
            existingInfo.getAchievements().addAll(profile.getAchievements());
        }
        if (profile.getCertificates() != null) {
            existingInfo.getCertificates().clear();
            existingInfo.getCertificates().addAll(profile.getCertificates());
        }
        if (profile.getInternships() != null) {
            existingInfo.getInternships().clear();
            existingInfo.getInternships().addAll(profile.getInternships());
        }
        if (profile.getResumeUrl() != null) {
            existingInfo.setResumeUrl(profile.getResumeUrl());
        }
        if (profile.getWorkStatus() != null) {
            existingInfo.setWorkStatus(profile.getWorkStatus());
        }
        if (profile.getGithubLink() != null) {
            existingInfo.setGithubLink(profile.getGithubLink());
        }
        if (profile.getLinkedinLink() != null) {
            existingInfo.setLinkedinLink(profile.getLinkedinLink());
        }

        return profileRepository.save(existingInfo);
    }
    
    @DeleteMapping("/certificate/{index}")
    public StudentProfile deleteCertificate(@PathVariable int index, Principal principal) {
        String email = principal.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        StudentProfile profile = profileRepository.findByUser(user).orElseThrow(() -> new RuntimeException("Profile not found"));
        
        if (index >= 0 && index < profile.getCertificates().size()) {
            profile.getCertificates().remove(index);
            return profileRepository.save(profile);
        }
        throw new RuntimeException("Invalid index");
    }
    
    @DeleteMapping("/internship/{index}")
    public StudentProfile deleteInternship(@PathVariable int index, Principal principal) {
        String email = principal.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        StudentProfile profile = profileRepository.findByUser(user).orElseThrow(() -> new RuntimeException("Profile not found"));
        
        if (index >= 0 && index < profile.getInternships().size()) {
            profile.getInternships().remove(index);
            return profileRepository.save(profile);
        }
        throw new RuntimeException("Invalid index");
    }
    
    @DeleteMapping("/project/{index}")
    public StudentProfile deleteProject(@PathVariable int index, Principal principal) {
        String email = principal.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        StudentProfile profile = profileRepository.findByUser(user).orElseThrow(() -> new RuntimeException("Profile not found"));
        
        if (index >= 0 && index < profile.getProjects().size()) {
            profile.getProjects().remove(index);
            return profileRepository.save(profile);
        }
        throw new RuntimeException("Invalid index");
    }
    
    @DeleteMapping("/experience/{index}")
    public StudentProfile deleteExperience(@PathVariable int index, Principal principal) {
        String email = principal.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        StudentProfile profile = profileRepository.findByUser(user).orElseThrow(() -> new RuntimeException("Profile not found"));
        
        if (index >= 0 && index < profile.getExperiences().size()) {
            profile.getExperiences().remove(index);
            return profileRepository.save(profile);
        }
        throw new RuntimeException("Invalid index");
    }
}
