package com.recruitsmart.repository;

import com.recruitsmart.model.Application;
import com.recruitsmart.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStudent(User student);
    List<Application> findByJobId(Long jobId);
}
