# Documentation: RecruitSmart CRM Application

## Overview
RecruitSmart is a modern CRM application tailored for organizations to manage leads, customers, and recruitment pipelines. It uniquely bridges the gap between students and employers using data-driven insights.

## Technology Stack
- **Frontend**: React (with a custom Glassmorphism CSS system)
- **Backend**: Spring Boot, Spring Data JPA, H2 Database
- **ML Engine**: Custom Java-based simulation of lead scoring and candidate matching algorithms.

## Key Features
1. **Lead Tracking**: Comprehensive CRUD operations for managing potential recruitment leads.
2. **ML Scoring**: Intelligent scoring of leads based on interaction patterns and company profiles.
3. **Role-Based Access (RBAC)**: Secure access levels for Managers, Sales Reps, and Students (using JWT).
4. **Sales Pipeline**: Visual Kanban board for tracking opportunity stages.
5. **Student/Employee Profiles**: Unified interface for tracking both sets of users.

## Setup Instructions
1. **Backend**: Navigate to `/backend` and run `mvn spring-boot:run`.
2. **Frontend**: Navigate to `/frontend` and run `npm run dev`.

## Future Extensions
- Integration with real ML models using Python/TensorFlow.
- Advanced reporting dashboards with Chart.js.
- Real-time notifications for pipeline updates.
