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
        return userRepository.findAll();
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
        user.setEnabled(true);
        userRepository.save(user);
        return Map.of("message", "User approved successfully");
    }
}
