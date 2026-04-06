package com.recruitsmart.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("--- Starting Manual Database Table Verification ---");
        String[] tables = {
            "student_profile_education",
            "student_profile_experience",
            "student_profile_project",
            "student_profile_skill",
            "student_profile_achievement",
            "student_profile_internship",
            "student_profile_certificate",
            "student_profile_document"
        };

        for (String table : tables) {
            try {
                System.out.println("Verifying table: " + table);
                if (table.contains("education")) {
                    jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS " + table + " (" +
                            "student_profile_id BIGINT NOT NULL, " +
                            "school_name VARCHAR(255), " +
                            "course VARCHAR(255), " +
                            "year_of_passing VARCHAR(50), " +
                            "result VARCHAR(50))");
                } else if (table.contains("experience") || table.contains("internship")) {
                    jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS " + table + " (" +
                            "student_profile_id BIGINT NOT NULL, " +
                            "company_name VARCHAR(255), " +
                            "designation VARCHAR(255), " +
                            "duration VARCHAR(100), " +
                            "description TEXT)");
                } else if (table.contains("project") || table.contains("certificate")) {
                    jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS " + table + " (" +
                            "student_profile_id BIGINT NOT NULL, " +
                            "title VARCHAR(255), " +
                            "description TEXT, " +
                            "link VARCHAR(500))");
                } else if (table.contains("skill")) {
                    jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS " + table + " (" +
                            "student_profile_id BIGINT NOT NULL, " +
                            "name VARCHAR(255), " +
                            "type VARCHAR(100))");
                } else if (table.contains("achievement")) {
                    jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS " + table + " (" +
                            "student_profile_id BIGINT NOT NULL, " +
                            "title VARCHAR(255), " +
                            "description TEXT)");
                } else if (table.contains("document")) {
                    jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS " + table + " (" +
                            "student_profile_id BIGINT NOT NULL, " +
                            "name VARCHAR(255), " +
                            "type VARCHAR(50), " +
                            "size VARCHAR(50), " +
                            "date VARCHAR(50), " +
                            "content LONGTEXT)");
                }
                System.out.println("✅ Table verified: " + table);
            } catch (Exception e) {
                System.err.println("❌ ERROR on " + table + ": " + e.getMessage());
            }
        }
        System.out.println("--- Manual Initialization Complete ---");
    }
}
