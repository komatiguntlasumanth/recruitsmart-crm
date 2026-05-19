---
marp: true
theme: default
class: lead
backgroundColor: #f4f4f9
style: |
  section {
    font-size: 24px;
    padding: 40px;
    justify-content: flex-start;
  }
  section.lead {
    justify-content: center;
    text-align: center;
  }
  h1, h2 {
    color: #b91c1c; /* Crimson matching the UI */
  }
  li {
    margin-bottom: 8px;
  }
  table {
    font-size: 16px;
    width: 100%;
  }
  th {
    background-color: #b91c1c;
    color: white;
  }
---

<!-- classes: lead -->
# RecruitSmart: AI-Powered Recruitment CRM Application
**SRI VENKATAESHWARA COLLEGE OF ENGINEERING AND TECHNOLOGY**
R.V.S Nagar, Chittoor – 517 127. (A.P)
DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING(AI & ML)

**Team Members:**
K.SUMATHI (22781A3366) | K.V. LIKHITHA (22781A3367) | K.SUMANTH (22781A3369)
K.SINDHU RANI (22781A3375) | L.BHARATHI (22781A3379)

**Project Guide:**
Mr. Madhi Madhan L, Assistant professor Department of CSE(AI & ML)

---

## Slide 2: Problem Statement & Abstract

Traditional recruitment processes are frequently hampered by fragmented data, inefficient applicant tracking, and a lack of personalized interaction. Evaluating student profiles against job requirements manually is time-consuming and prone to errors. 

There is a critical need for an integrated Customer Relationship Management (CRM) platform that leverages Artificial Intelligence to orchestrate the recruitment lifecycle. 

This project, RecruitSmart, addresses these challenges by delivering a unified, cross-platform solution (Web and Android) featuring intelligent chatbot assistance, automated profile synchronization, and secure, centralized data management to streamline the connection between candidates and opportunities.

---

## Slide 3: Literature Review

| S.No | Paper Title | Algorithm / Method Used | Findings |
| --- | --- | --- | --- |
| 1 | AI-Driven Recruitment Systems | Machine Learning, NLP | AI significantly reduces screening time. |
| 2 | Modern CRM Architectures | Cloud, Microservices | Cloud offers better scalability for student portals. |
| 3 | Evaluating Chatbots in HR | Conversational AI | Chatbots enhance candidate engagement 24/7. |
| 4 | Security in Cloud Databases | Role-Based Access Control | Implementing RBAC protects sensitive data. |
| 5 | Cross-Platform Mobile Apps | PWA wrapper | Wrapper frameworks provide near-native performance. |
| 6 | Real-time Data Synchronization | REST APIs, WebSockets | Asynchronous calls improve UI responsiveness. |
| 7 | Large Language Models | Gen-AI, Transformers | LLMs provide tailored job recommendations. |
| 8 | Automated Resume Parsing | Named Entity Recognition | NER effectively structures unstructured text. |
| 9 | UX/UI Principles for Dashboards | Component-based UI | Consistent theming reduces cognitive load. |
| 10 | Agile Methodology | Scrum, Iterative Dev | Iterative cycles allow rapid adaptation. |

---

## Slide 4: Current vs. Proposed System

**Disadvantages of Existing Methods:**
- Manual data entry and repetitive screening tasks have high error rates.
- Lack of integrated AI support leads to generic communication and slow candidate responses.
- Disjointed platforms require context-switching between web browsers and apps.
- Poor offline support and frequent data synchronization failures.

**Advantages of the Proposed Method:**
- Intelligent automation through AI integration for personalized candidate guidance.
- Unified, responsive cross-platform availability (Desktop Web and Android application).
- Secure, robust data persistence with centralized backend architecture.
- Intuitive, modern Student Dashboard ensuring seamless profile updates.

---

## Slide 5: System Architecture Diagram

*(A hierarchical diagram showing the React Frontend, Capacitor mobile wrapper, Spring Boot REST API layer, Google Gemini AI integration, and the Railway MySQL Database)*

*Placeholder for Architecture Design Diagram Image.*

---

## Slide 5.1: Methodology

The implementation follows an Agile Software Development lifecycle, employing a decoupled client-server architecture. The backend is constructed using Spring Boot, exposing secure RESTful endpoints for CRUD operations, integrated with a cloud-hosted MySQL database. The frontend utilizes React with Vite, styled for premium user experience, and bundled for Android using Capacitor. 

**<span style="color: #b91c1c;">For intelligent features, we utilize the Gemini Large Language Model (LLM) API, applying Prompt Engineering algorithms and intent recognition to parse candidate queries and dynamically generate personalized career guidance.</span>**

---

## Slide 6: Dataset Description

The application processes and manages several critical data structures:

- **Student Profiles:** Contains demographic details, academic records, skills, and portfolio links.
- **System Users:** Authentication credentials, roles (Admin, Student, Recruiter), and authorization tokens.
- **Interaction Logs:** Historical data of AI chatbot conversations for context retention.
- **Job Postings:** Descriptions, required skills, and qualification metadata.

---

## Slide 7: Hardware and Software Requirements

**Hardware Requirements:**
- Processor: Intel Core i5 or equivalent (Minimum)
- RAM: 8 GB (16 GB recommended for concurrent compilation)
- Storage: 256 GB SSD
- Mobile Device: Android 9.0 (Pie) or higher for APK deployment

**Software Requirements:**
- IDE: Visual Studio Code, Android Studio
- Backend Framework: Java Development Kit (JDK) 17, Spring Boot 3
- Frontend Stack: Node.js 18+, React / Vite, Capacitor CLI
- Database: MySQL Server
- APIs: Google Gemini API

---

## Slide 8: Algorithm / Pseudo Code

**Algorithm: Profile-Aware AI Response Generation**

```text
Step 1: Receive user_query from Student Dashboard
Step 2: Fetch student_profile_data (Skills, Education) from Database via API
Step 3: ** Formula applied -> P(Context) = Context_Builder(user_query, profile_data) **
Step 4: Initialize connection to Gemini API Endpoint
Step 5: Transmit Prompt(P(Context)) with predefined System Instructions
Step 6: Receive generated_response_stream from LLM
Step 7: Parse response and render dynamic Markdown in Chatbot UI
Step 8: Log interaction into User_History table
Step 9: Return success status Code 200
```

---

## Slide 9: Login Screen

**Welcome Back with User Authentication (Input Data: Email, Password)**

*(Please insert Login Screenshot here)*

---

## Slide 10: Main System Dashboard Overview

**"Good Afternoon" with job recommendations & completion tracking (Output)**

*(Please insert Student Dashboard Screenshot here)*

---

## Slide 11: Student Profile View

**Educational summary & profile sections (Input / Edit)**

*(Please insert Student Profile Screenshot here)*

---

## Slide 12: HR Dashboard

**Recruitment insights and recent applicants (Output)**

*(Please insert HR/Recruiter Dashboard Screenshot here)*

---

## Slide 13: Admin Dashboard

**Showing system metrics (Registered Users, Active Users) & User Search functionality**

*(Please insert Admin Dashboard Screenshot here)*

---

## Slide 14: AI Chatbot Interface

**Submitting a prompt and generating dynamic career recommendations (Input/Output)**

*(Please insert Chatbot Recommendation Screenshot here)*

---

## Slide 15: Post a Job Modal

**Recruiter view for creating a new job posting with specific requirements**

*(Please insert Post Job Inputs Screenshot here)*

---

## Slide 16: Postings Management

**Job listings overview showing open positions and active applicant counts (Output)**

*(Please insert Job Postings Screen here)*

---

## Slide 17: Conclusion

The RecruitSmart CRM application successfully bridges the gap between traditional applicant tracking and modern, intelligent platforms. 

By integrating AI with a robust backend and deploying across both Web and Android platforms, the system significantly enhances the user experience. Secure data persistence and dynamic chatbots provide an efficient, scalable ecosystem for candidate profile management in a modern world.

---

## Slide 18: Future Scope

- **Advanced Resume Parsing:** Implement Optical Character Recognition (OCR) to automatically extract data from uploaded PDF resumes.
- **Predictive Analytics:** Utilize machine learning models to predict student placement success rates based on historical data.
- **Video Interviewing Integration:** Incorporate WebRTC for direct, in-browser technical screening and interviews.
- **iOS Deployment:** Expand mobile accessibility by compiling the existing Capacitor codebase into a native iOS application.
- **Automated Skill Assessment:** Integrate automated coding challenges and quizzes directly within the student portal.

---

## Slide 19: References

1. Alarcon, J. (2022). *Modern Web Application Development with React and Spring Boot*. Tech Press.
2. O'Brien, M. (2023). *Cross-Platform Mobile Apps with Capacitor and Ionic*. Developer Horizons.
3. Brown, A. (2023). *Integrating Generative AI into Enterprise Systems*. AI Quarterly.
4. Smith, L. (2021). *Secure RESTful API Design Considerations*. Journal of Software Engineering.
5. Patel, N. (2022). *Cloud Database Management using MySQL*. Data Systems Review.
6. Davis, R. (2023). *UX/UI Best Practices for AI Interfaces*. Design Journal.
7. Google DeepMind (2024). *Gemini API Documentation*.
8. Spring Boot Documentation (2024).
