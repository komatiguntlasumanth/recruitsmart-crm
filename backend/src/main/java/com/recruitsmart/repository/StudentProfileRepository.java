package com.recruitsmart.repository;

import com.recruitsmart.model.StudentProfile;
import com.recruitsmart.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByUser(User user);
    
    @Query("SELECT p FROM StudentProfile p WHERE p.user.email = :email")
    Optional<StudentProfile> findByUserEmail(@Param("email") String email);
    
    Optional<StudentProfile> findByUserId(Long userId);
}
