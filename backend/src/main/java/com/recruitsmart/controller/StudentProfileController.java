package com.recruitsmart.controller;

import com.recruitsmart.model.StudentProfile;
import com.recruitsmart.model.User;
import com.recruitsmart.repository.StudentProfileRepository;
import com.recruitsmart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;


import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/student/profile")
public class StudentProfileController {

    @Autowired
    private StudentProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.recruitsmart.service.EmailService emailService;

    @GetMapping
    public StudentProfile getProfile(Principal principal) {
        String email = principal.getName();
        System.out.println("Fetching profile for: " + email);
        return profileRepository.findByUserEmail(email)
                .orElseGet(() -> {
                    StudentProfile newProfile = new StudentProfile();
                    userRepository.findByEmail(email).ifPresent(newProfile::setUser);
                    return newProfile;
                });
    }

    @GetMapping("/user/{userId}")
    public StudentProfile getProfileByUserId(@PathVariable long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return profileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
    }

    @PostMapping
    @Transactional
    public StudentProfile updateProfile(@jakarta.validation.Valid @RequestBody StudentProfile profile, Principal principal) {
        String email = principal.getName();
        System.out.println("Updating profile for: " + email);
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Find existing or create new
        StudentProfile existingInfo = profileRepository.findByUser(user).orElse(new StudentProfile());
        
        // Update basic fields
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
        existingInfo.setResumeUrl(profile.getResumeUrl());
        existingInfo.setWorkStatus(profile.getWorkStatus());
        existingInfo.setGithubLink(profile.getGithubLink());
        existingInfo.setLinkedinLink(profile.getLinkedinLink());
        existingInfo.setLevel(profile.getLevel());
        
        // Sync Collections - Avoid replacing the collection instance
        updateCollection(existingInfo.getEducation(), profile.getEducation());
        updateCollection(existingInfo.getExperiences(), profile.getExperiences());
        updateCollection(existingInfo.getProjects(), profile.getProjects());
        updateCollection(existingInfo.getSkills(), profile.getSkills());
        updateCollection(existingInfo.getAchievements(), profile.getAchievements());
        updateCollection(existingInfo.getCertificates(), profile.getCertificates());
        updateCollection(existingInfo.getInternships(), profile.getInternships());
        updateCollection(existingInfo.getDocuments(), profile.getDocuments());

        StudentProfile savedProfile = profileRepository.save(existingInfo);
        
        // Send email notification
        try {
            emailService.sendProfileUpdateEmail(user.getEmail(), "your profile details have been successfully updated.");
        } catch (Exception e) {
            System.err.println("Error sending update email: " + e.getMessage());
        }

        return savedProfile;
    }

    private <T> void updateCollection(java.util.List<T> target, java.util.List<T> source) {
        target.clear();
        if (source != null) {
            target.addAll(source);
        }
    }
    
    @DeleteMapping("/certificate/{index}")
    public StudentProfile deleteCertificate(@PathVariable int index, Principal principal) {
        String email = principal.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        StudentProfile profile = profileRepository.findByUser(user).orElseThrow(() -> new RuntimeException("Profile not found"));
        
        if (index >= 0 && index < profile.getCertificates().size()) {
            profile.getCertificates().remove(index);
            StudentProfile saved = profileRepository.save(profile);
            emailService.sendProfileUpdateEmail(email, "a certificate has been removed from your profile.");
            return saved;
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
            StudentProfile saved = profileRepository.save(profile);
            emailService.sendProfileUpdateEmail(email, "an internship has been removed from your profile.");
            return saved;
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
            StudentProfile saved = profileRepository.save(profile);
            emailService.sendProfileUpdateEmail(email, "a project has been removed from your profile.");
            return saved;
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
            StudentProfile saved = profileRepository.save(profile);
            emailService.sendProfileUpdateEmail(email, "an experience entry has been removed from your profile.");
            return saved;
        }
        throw new RuntimeException("Invalid index");
    }
}
