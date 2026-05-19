package com.recruitsmart.service;

import com.recruitsmart.model.Notification;
import com.recruitsmart.model.User;
import com.recruitsmart.repository.NotificationRepository;
import com.recruitsmart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public void createNotification(User user, String message, String type) {
        Notification notification = new Notification(user, message, type);
        notificationRepository.save(notification);
    }

    @Transactional
    public void createNotificationToAllStudents(String message, String type) {
        List<User> students = userRepository.findAll().stream()
                .filter(u -> "ROLE_STUDENT".equals(u.getRole()))
                .toList();
        
        for (User student : students) {
            createNotification(student, message, type);
        }
    }

    public List<Notification> getNotificationsForUser(User user) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        if (notificationId != null) {
            notificationRepository.findById(notificationId).ifPresent(n -> {
                n.setRead(true);
                notificationRepository.save(n);
            });
        }
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().filter(n -> !n.isRead()).toList();
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}
