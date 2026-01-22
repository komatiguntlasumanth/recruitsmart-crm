package com.recruitsmart.service;

import com.recruitsmart.model.Job;
import com.recruitsmart.model.StudentProfile;
import com.recruitsmart.repository.JobRepository;
import com.recruitsmart.repository.StudentProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AiIndexService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private VectorStoreService vectorStoreService;

    // Disabled startup indexing to save memory on 512MB instances
    // @EventListener(ApplicationReadyEvent.class)
    @Transactional(readOnly = true)
    public void initIndex() {
        // refreshIndex(); 
        System.out.println("AI Indexing on startup skipped (Memory Optimization)");
    }

    @Transactional(readOnly = true)
    public void refreshIndex() {
        indexJobs();
        indexStudents();
    }

    public void indexJobs() {
        List<Job> jobs = jobRepository.findAll();
        for (Job job : jobs) {
            String content = String.format("Job Title: %s. Company: %s. Description: %s. Location: %s.",
                    job.getTitle(), job.getCompanyName(), job.getDescription(), job.getLocation());
            List<Double> embedding = geminiService.getEmbedding(content);
            vectorStoreService.saveJobEmbedding(job.getId(), embedding);
        }
    }

    public void indexStudents() {
        List<StudentProfile> students = studentProfileRepository.findAll();
        for (StudentProfile student : students) {
            String skills = student.getSkills().stream().map(s -> s.getName()).collect(Collectors.joining(", "));
            String content = String.format("Student Designation: %s. Summary: %s. Skills: %s. Experience: %s years.",
                    student.getDesignation(), student.getProfileSummary(), skills, student.getYearsOfExperience());
            List<Double> embedding = geminiService.getEmbedding(content);
            vectorStoreService.saveStudentEmbedding(student.getId(), embedding);
        }
    }
}
