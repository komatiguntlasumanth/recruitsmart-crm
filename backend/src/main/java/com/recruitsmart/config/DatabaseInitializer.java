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

        try {
            // 1. Education Table
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS student_profile_education (" +
                    "student_profile_id BIGINT NOT NULL, " +
                    "school_name VARCHAR(255), " +
                    "course VARCHAR(255), " +
                    "year_of_passing VARCHAR(50), " +
                    "result VARCHAR(50))");
            System.out.println("✅ Table verified: student_profile_education");

            // 2. Experience Table
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS student_profile_experience (" +
                    "student_profile_id BIGINT NOT NULL, " +
                    "company_name VARCHAR(255), " +
                    "designation VARCHAR(255), " +
                    "duration VARCHAR(100), " +
                    "description TEXT)");
            System.out.println("✅ Table verified: student_profile_experience");

            // 3. Project Table
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS student_profile_project (" +
                    "student_profile_id BIGINT NOT NULL, " +
                    "title VARCHAR(255), " +
                    "description TEXT, " +
                    "link VARCHAR(500))");
            System.out.println("✅ Table verified: student_profile_project");

            // 4. Skill Table
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS student_profile_skill (" +
                    "student_profile_id BIGINT NOT NULL, " +
                    "name VARCHAR(255), " +
                    "type VARCHAR(100))");
            System.out.println("✅ Table verified: student_profile_skill");

            // 5. Achievement Table
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS student_profile_achievement (" +
                    "student_profile_id BIGINT NOT NULL, " +
                    "title VARCHAR(255), " +
                    "description TEXT)");
            System.out.println("✅ Table verified: student_profile_achievement");

            // 6. Internship Table (reusing Experience structure)
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS student_profile_internship (" +
                    "student_profile_id BIGINT NOT NULL, " +
                    "company_name VARCHAR(255), " +
                    "designation VARCHAR(255), " +
                    "duration VARCHAR(100), " +
                    "description TEXT)");
            System.out.println("✅ Table verified: student_profile_internship");

            // 7. Certificate Table (reusing Project structure)
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS student_profile_certificate (" +
                    "student_profile_id BIGINT NOT NULL, " +
                    "title VARCHAR(255), " +
                    "description TEXT, " +
                    "link VARCHAR(500))");
            System.out.println("✅ Table verified: student_profile_certificate");

            // 8. Document Table
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS student_profile_document (" +
                    "student_profile_id BIGINT NOT NULL, " +
                    "name VARCHAR(255), " +
                    "type VARCHAR(50), " +
                    "size VARCHAR(50), " +
                    "date VARCHAR(50), " +
                    "content LONGTEXT)");
            System.out.println("✅ Table verified: student_profile_document");

            System.out.println("--- Database Manual Initialization Complete ---");

        } catch (Exception e) {
            System.err.println("❌ Error during manual database initialization: " + e.getMessage());
        }
    }
}
