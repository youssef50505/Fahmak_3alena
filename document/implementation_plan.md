# Fahmak Alena - AI-Powered Educational Platform

## Goal Description
Build "Fahmak Alena", a comprehensive AI-powered educational platform featuring personalized learning paths, adaptive assessments, gamification, and specialized dashboards for Students, Instructors, and Administrators. 
The platform will use a Microservices Architecture. The frontend will be built using **Angular 17+** with Tailwind CSS and NgRx, while the backend will utilize **Spring Boot 3.x** (Java), PostgreSQL, Redis, and integrate with **Google Gemini / Vertex AI**.

## User Review Required
> [!IMPORTANT]
> - **Architecture Scope**: Microservices architecture involves multiple backend services (API Gateway, User Service, Course Service, etc.). Do you want to initialize all of these as separate Spring Boot projects immediately, or start with a monolithic Spring Boot structure and split them later for easier initial development?
> - **UI/UX Assets**: The provided Visily screenshots give a clear direction. We will use Tailwind CSS to match the styling (fonts, colors, layout). Is there a specific UI component library (like Angular Material or PrimeNG) you prefer to combine with Tailwind, or should we build components from scratch using Tailwind?
> - **AI Integration**: To implement the AI Chatbot and personalized recommendations, we will need access to Google Gemini API keys. 

## Open Questions
- Do we have an existing database schema setup, or should we create the PostgreSQL schemas from scratch based on the Conceptual ERD?
- Will we use Docker from the beginning to containerize the Spring Boot microservices and PostgreSQL/Redis dependencies for a smoother local development experience?

## Proposed Changes

### 1. Project Initialization & Setup
- **Frontend Workspace**: Generate an Angular workspace `fahmak-alena-frontend` with Tailwind CSS, NgRx for state management, and basic routing.
- **Backend Workspace**: Generate a parent Maven/Gradle project `fahmak-alena-backend` to house the microservices.
- **Infrastructure**: Set up a `docker-compose.yml` for PostgreSQL and Redis to ensure a consistent local development environment.

### 2. Backend - Core Microservices (Spring Boot)
- **API Gateway**: Spring Cloud Gateway to route requests to respective microservices and handle CORS/global security.
- **User Service**: Manage authentication (Spring Security, JWT), registration, profiles, and roles (Student, Instructor, Admin).
- **Course Service**: Manage courses, modules, lessons, and content uploads.
- **Assessment Service**: Logic for adaptive quizzes, grading, and cheating detection alerts.
- **Gamification Service**: Track XP, badges, leaderboards, and achievements.
- **AI Learning Service**: Orchestrate prompts and interactions with the Gemini API for personalized paths, automated feedback, and chatbot tutoring.

### 3. Frontend - Core Modules (Angular)
- **Shared Module**: Reusable UI components (buttons, cards, modals, navigation sidebars, headers).
- **Auth Module**: Login and registration screens (email/password & social).
- **Student Portal**: 
  - Student Dashboard (Progress, Leaderboard, Recommendations, Achievements)
  - Adaptive Assessment UI (Questions, Timer, AI Feedback)
  - Immersive Hub Placeholder (UI for 3D/VR module selection)
  - Accessibility & Preferences (UI controls for visual and persona settings)
- **Instructor Portal**: 
  - Instructor Dashboard (Analytics, Cheating Alerts, Student Progress)
  - Course Creation tools & Resource Management
- **Admin Portal**: 
  - Admin Dashboard (System overview, user growth, revenue)
  - User & Subscription Management
- **Virtual Classroom**: Live session UI with video placeholders, chat, and "Live AI Transcript" component.

### 4. Database & State
- Create Liquibase/Flyway migration scripts for PostgreSQL based on the ERD (User, Profile, Enrollment, Gamification, Course, etc.).
- Set up NgRx stores for managing user session, courses, and active assessments on the frontend.

## Verification Plan

### Automated Tests
- **Backend**: JUnit & Mockito for unit testing service logic; Spring Boot Test for integration testing REST endpoints.
- **Frontend**: Jasmine/Karma for Angular component tests.

### Manual Verification
- Start local infrastructure via `docker-compose`.
- Boot up all Spring Boot microservices and the API Gateway.
- Serve the Angular application.
- Verify user registration/login flow.
- Navigate to the Student Dashboard and verify UI matches the Visily designs.
- Test responsive design across simulated desktop and mobile views.
