package com.recruitsmart.controller;

import com.recruitsmart.model.User;
import com.recruitsmart.repository.UserRepository;
import com.recruitsmart.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    public AuthController() {
    }

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
    public Map<String, Object> register(@jakarta.validation.Valid @RequestBody User user) {
        // Manual checks that are not easily done via annotations (like DB existence checks)
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered.");
        }

        if (user.getUsername() != null && !user.getUsername().isEmpty()) {
            if (userRepository.findByUsername(user.getUsername()).isPresent()) {
                throw new RuntimeException("Username already taken.");
            }
        } else {
            user.setUsername(user.getEmail()); // Fallback if not provided
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Auto-assign role based on specific rules
        String email = user.getEmail().toLowerCase();
        System.out.println("========== REGISTRATION DEBUG ==========");
        System.out.println("Email: " + email);
        
        if (email.equals("komatiguntlasumanths@admin.com")) {
            user.setRole("ROLE_ADMIN");
            user.setEnabled(true);
            System.out.println("Role assigned: ROLE_ADMIN, Enabled: true");
        } else if (email.endsWith("@hr.com")) {
            user.setRole("ROLE_HR");
            user.setEnabled(false); // Requires Admin Approval
            System.out.println("Role assigned: ROLE_HR, Enabled: false - PENDING APPROVAL");
        } else if (email.endsWith("@manager.com")) {
            user.setRole("ROLE_MANAGER");
            user.setEnabled(true);
            System.out.println("Role assigned: ROLE_MANAGER, Enabled: true");
        } else if (email.endsWith("@gmail.com")) {
            user.setRole("ROLE_STUDENT");
            user.setEnabled(true);
            System.out.println("Role assigned: ROLE_STUDENT, Enabled: true");
        } else {
            // Default role for any other domain
            user.setRole("ROLE_STUDENT");
            user.setEnabled(true);
            System.out.println("Role assigned: ROLE_STUDENT (default), Enabled: true");
        }
        
        User savedUser = userRepository.save(user);
        System.out.println("User saved with ID: " + savedUser.getId());
        System.out.println("Final enabled status: " + savedUser.isEnabled());
        System.out.println("Final role: " + savedUser.getRole());
        System.out.println("========================================");
        
        String token = null;
        if (user.isEnabled()) {
            token = jwtUtil.generateToken(user.getEmail());
        }

        // Return different response based on approval status
        if (token != null) {
            return Map.of(
                "message", "Registration successful!",
                "token", token,
                "user", user
            );
        } else {
            // For pending approval (HR users)
            return Map.of(
                "message", "Registration pending admin approval",
                "user", user
            );
        }
    }

    @PostMapping("/login")
    public org.springframework.http.ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("This email is not registered. Please go to the registration page."));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            return org.springframework.http.ResponseEntity.status(401).body(Map.of("message", "Invalid email or password."));
        }
        
        if (!user.isEnabled()) {
            return org.springframework.http.ResponseEntity.status(403).body(Map.of("message", "Account is pending approval. Please contact Admin."));
        }
        
        // Update Last Login
        user.setLastLogin(java.time.LocalDateTime.now());
        userRepository.save(user);
        
        String token = jwtUtil.generateToken(user.getEmail());
        return org.springframework.http.ResponseEntity.ok(Map.of("token", token, "user", user));
    }

    @GetMapping("/me")
    public org.springframework.http.ResponseEntity<?> getCurrentUser(java.security.Principal principal) {
        if (principal == null) {
            return org.springframework.http.ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
        }
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return org.springframework.http.ResponseEntity.ok(user);
    }
}
