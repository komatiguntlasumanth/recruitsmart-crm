package com.recruitsmart.repository;

import com.recruitsmart.model.StudentProfile;
import com.recruitsmart.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByUser(User user);
    Optional<StudentProfile> findByUserEmail(String email);
    Optional<StudentProfile> findByUserId(Long userId);
}
