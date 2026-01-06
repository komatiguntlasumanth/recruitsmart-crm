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

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final String PASSWORD_REGEX = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,}$";

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody User user) {
        if (!user.getPassword().matches(PASSWORD_REGEX)) {
            throw new RuntimeException("Password must be at least 6 characters and include 1 uppercase, 1 lowercase, 1 number, and 1 special character.");
        }

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
        // user.setEnabled(true); Moved to role logic
        
        // Auto-assign role based on specific rules
        // Auto-assign role based on specific rules
        String email = user.getEmail().toLowerCase();
        if (email.equals("komatiguntlasumanths@admin.com")) {
            user.setRole("ROLE_ADMIN");
            user.setEnabled(true);
        } else if (email.endsWith("@hr.com")) {
            user.setRole("ROLE_HR");
            user.setEnabled(false); // Requires Admin Approval
        } else if (email.endsWith("@manager.com")) {
            user.setRole("ROLE_MANAGER");
            user.setEnabled(false); // Requires Admin Approval
        } else {
            user.setRole("ROLE_STUDENT"); // Default to student
            user.setEnabled(true);
        }
        
        userRepository.save(user);
        
        // Auto-login only if enabled
        String token = null;
        if (user.isEnabled()) {
            token = jwtUtil.generateToken(user.getEmail());
        }

        return Map.of(
            "message", "Registration successful!",
            "token", token != null ? token : "",
            "user", user
        );
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("This email is not registered. Please go to the registration page."));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid email or password.");
        }
        
        if (!user.isEnabled()) {
            throw new RuntimeException("Account is pending approval. Please contact Admin.");
        }
        
        String token = jwtUtil.generateToken(user.getEmail());
        return Map.of("token", token, "user", user);
    }
}
