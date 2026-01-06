package com.recruitsmart.controller;

import com.recruitsmart.model.Job;
import com.recruitsmart.model.StudentProfile;
import com.recruitsmart.repository.JobRepository;
import com.recruitsmart.repository.StudentProfileRepository;
import com.recruitsmart.service.AiIndexService;
import com.recruitsmart.service.GeminiService;
import com.recruitsmart.service.VectorStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiRecommendationController {

    @Autowired
    private VectorStoreService vectorStoreService;

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private AiIndexService aiIndexService;

    @GetMapping("/recommend-jobs/{studentId}")
    public ResponseEntity<List<Job>> recommendJobs(@PathVariable Long studentId) {
        StudentProfile student = studentProfileRepository.findById(studentId).orElse(null);
        if (student == null) return ResponseEntity.notFound().build();

        String skills = student.getSkills().stream().map(s -> s.getName()).collect(Collectors.joining(", "));
        String content = String.format("Student: %s. Skills: %s. Experience: %d.", 
                student.getDesignation(), skills, student.getYearsOfExperience());
        
        List<Double> embedding = geminiService.getEmbedding(content);
        List<Long> similarJobIds = vectorStoreService.findSimilarJobs(embedding, 5);
        
        List<Job> recommendedJobs = jobRepository.findAllById(similarJobIds);
        return ResponseEntity.ok(recommendedJobs);
    }

    @GetMapping("/rank-candidates/{jobId}")
    public ResponseEntity<List<StudentProfile>> rankCandidates(@PathVariable Long jobId) {
        Job job = jobRepository.findById(jobId).orElse(null);
        if (job == null) return ResponseEntity.notFound().build();

        String content = String.format("Job: %s. Description: %s.", job.getTitle(), job.getDescription());
        
        List<Double> embedding = geminiService.getEmbedding(content);
        List<Long> similarStudentIds = vectorStoreService.findSimilarStudents(embedding, 10);
        
        List<StudentProfile> rankedStudents = studentProfileRepository.findAllById(similarStudentIds);
        return ResponseEntity.ok(rankedStudents);
    }

    @PostMapping("/refresh-index")
    public ResponseEntity<String> refreshIndex() {
        aiIndexService.refreshIndex();
        return ResponseEntity.ok("AI Index Refreshed Successfully");
    }
}
