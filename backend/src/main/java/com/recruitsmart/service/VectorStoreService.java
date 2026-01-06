package com.recruitsmart.service;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class VectorStoreService {

    // Store embeddings for Jobs and Students
    private final Map<Long, List<Double>> jobEmbeddings = new HashMap<>();
    private final Map<Long, List<Double>> studentEmbeddings = new HashMap<>();

    public void saveJobEmbedding(Long jobId, List<Double> embedding) {
        jobEmbeddings.put(jobId, embedding);
    }

    public void saveStudentEmbedding(Long studentId, List<Double> embedding) {
        studentEmbeddings.put(studentId, embedding);
    }

    public List<Long> findSimilarJobs(List<Double> studentEmbedding, int topK) {
        return jobEmbeddings.entrySet().stream()
                .map(entry -> new SimilarityResult(entry.getKey(), cosineSimilarity(studentEmbedding, entry.getValue())))
                .sorted((a, b) -> Double.compare(b.similarity, a.similarity))
                .limit(topK)
                .map(res -> res.id)
                .collect(Collectors.toList());
    }

    public List<Long> findSimilarStudents(List<Double> jobEmbedding, int topK) {
        return studentEmbeddings.entrySet().stream()
                .map(entry -> new SimilarityResult(entry.getKey(), cosineSimilarity(jobEmbedding, entry.getValue())))
                .sorted((a, b) -> Double.compare(b.similarity, a.similarity))
                .limit(topK)
                .map(res -> res.id)
                .collect(Collectors.toList());
    }

    private double cosineSimilarity(List<Double> vectorA, List<Double> vectorB) {
        if (vectorA.size() != vectorB.size()) return 0.0;
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;
        for (int i = 0; i < vectorA.size(); i++) {
            dotProduct += vectorA.get(i) * vectorB.get(i);
            normA += Math.pow(vectorA.get(i), 2);
            normB += Math.pow(vectorB.get(i), 2);
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private static class SimilarityResult {
        Long id;
        double similarity;
        SimilarityResult(Long id, double similarity) {
            this.id = id;
            this.similarity = similarity;
        }
    }
}
