package com.recruitsmart.controller;

import com.recruitsmart.model.Notification;
import com.recruitsmart.model.User;
import com.recruitsmart.repository.UserRepository;
import com.recruitsmart.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public List<Notification> getMyNotifications() {
        return notificationService.getNotificationsForUser(getCurrentUser());
    }

    @PutMapping("/{id}/read")
    public Map<String, String> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return Map.of("message", "Marked as read");
    }

    @PutMapping("/read-all")
    public Map<String, String> markAllAsRead() {
        notificationService.markAllAsRead(getCurrentUser().getId());
        return Map.of("message", "All marked as read");
    }
}
