package com.recruitsmart.controller;

import com.recruitsmart.model.User;
import com.recruitsmart.repository.UserRepository;
import com.recruitsmart.repository.StudentProfileRepository;
import com.recruitsmart.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
// Verified imports and package structure
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        long totalUsers = userRepository.count();
        // Mocking real-time stats for now as we don't have session tracking
        long activeUsers = Math.max(1, totalUsers / 5); 
        long loggedInUsers = Math.max(1, totalUsers / 3);

        Map<String, Object> stats = new HashMap<>();
        stats.put("registeredUsers", totalUsers);
        stats.put("activeUsers", activeUsers);
        stats.put("loggedInUsers", loggedInUsers);
        return stats;
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        List<User> users = userRepository.findAll();
        System.out.println("========== ADMIN USERS FETCH ==========");
        System.out.println("Total users: " + users.size());
        long hrPending = users.stream()
            .filter(u -> !u.isEnabled() && "ROLE_HR".equals(u.getRole()))
            .count();
        System.out.println("HR users pending approval: " + hrPending);
        
        // Log each HR user for debugging
        users.stream()
            .filter(u -> "ROLE_HR".equals(u.getRole()))
            .forEach(u -> System.out.println("  HR User - ID: " + u.getId() + ", Email: " + u.getEmail() + ", Enabled: " + u.isEnabled()));
        
        System.out.println("========================================");
        return users;
    }
    
    @GetMapping("/debug/hr-users")
    public Map<String, Object> debugHRUsers() {
        List<User> allUsers = userRepository.findAll();
        List<User> hrUsers = allUsers.stream()
            .filter(u -> "ROLE_HR".equals(u.getRole()))
            .collect(java.util.stream.Collectors.toList());
        List<User> hrPending = allUsers.stream()
            .filter(u -> !u.isEnabled() && "ROLE_HR".equals(u.getRole()))
            .collect(java.util.stream.Collectors.toList());
        
        System.out.println("========== DEBUG HR USERS ENDPOINT ==========");
        System.out.println("Total users in DB: " + allUsers.size());
        System.out.println("Total HR users: " + hrUsers.size());
        System.out.println("HR pending approval: " + hrPending.size());
        System.out.println("=============================================");
        
        return Map.of(
            "totalUsers", allUsers.size(),
            "hrUsers", hrUsers,
            "hrPending", hrPending,
            "hrPendingCount", hrPending.size()
        );
    }

    @DeleteMapping("/users/{id}")
    @org.springframework.transaction.annotation.Transactional
    public Map<String, String> deleteUser(@PathVariable Long id) {
        if (id == null) throw new IllegalArgumentException("ID cannot be null");
        
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));

        // 1. Delete associated Student Profile (if any)
        studentProfileRepository.findByUser(user).ifPresent(profile -> {
            if (profile != null) {
                studentProfileRepository.delete(profile);
            }
        });

        // 2. Delete associated Applications (if any)
        List<com.recruitsmart.model.Application> applications = applicationRepository.findByStudent(user);
        if (applications != null && !applications.isEmpty()) {
            applicationRepository.deleteAll(applications);
        }

        // 3. Delete the User
        if (user != null) {
            userRepository.delete(user);
        }
        
        return Map.of("message", "User and associated data deleted successfully");
    }

    @PutMapping("/users/{id}/approve")
    public Map<String, String> approveUser(@PathVariable Long id) {
        if (id == null) throw new IllegalArgumentException("ID cannot be null");
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        
        System.out.println("========== APPROVAL DEBUG ==========");
        System.out.println("Approving user ID: " + id);
        System.out.println("Email: " + user.getEmail());
        System.out.println("Role: " + user.getRole());
        System.out.println("Before - Enabled: " + user.isEnabled());
        
        user.setEnabled(true);
        userRepository.save(user);
        
        System.out.println("After - Enabled: " + user.isEnabled());
        System.out.println("====================================");
        
        return Map.of("message", "User approved successfully");
    }
}
