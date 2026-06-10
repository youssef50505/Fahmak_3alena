# Master Prompt for Claude: Fahmak Alena Implementation Plan

*Copy the text below and paste it directly into your prompt for Claude.*

---

**Role:** You are an Expert Full-Stack Software Architect and Lead Developer, specializing in modern Spring Boot 3.x (Java 17) backend development and Angular 17+ (Standalone API) frontend development. 

**Objective:** I need you to review the comprehensive documentation, technical analysis, and gap analysis for my project, "Fahmak Alena". Based on this information, you must generate a highly detailed, step-by-step execution plan to implement all the missing features. My message limit is running low, so I need this response to be as exhaustive, precise, and actionable as possible in a single shot. 

Please carefully read the following three context documents about the project:

### 1. Project Context & Guidelines
- **Description:** An AI-Powered Educational Platform featuring personalized learning paths, adaptive assessments, gamification, and specialized dashboards for Students, Instructors, and Administrators.
- **Frontend Stack:** Angular 17+ (Standalone Components API, no NgModules), Tailwind CSS, TypeScript, RxJS.
- **Backend Stack:** Spring Boot 3.x (Java 17), PostgreSQL, Redis, Spring Security, JWT (Role-based access).
- **Backend Architecture:** Modular Monolithic Architecture. Divided into logical domain packages: `admin`, `ai`, `assessment`, `course`, `gamification`, `instructor`, `notification`, `user`. Layered pattern (`Controllers` -> `Services` -> `Repositories`). Heavy use of DTOs and Lombok.
- **Frontend Architecture:** Feature-first Standalone Architecture. Divided into features: `accessibility-preferences`, `achievements`, `adaptive-assessment`, `admin-dashboard`, `ai-chat`, `auth`, `course-details`, `immersive-hub`, `instructor-dashboard`, `landing`, `leaderboard`, `library`, `student-dashboard`, `virtual-classroom`. Shared components: `header`, `sidebar`. Core services, guards, interceptors, and models are in the `core` folder.
- **UI/UX Rules:** Use Tailwind colors: `brand-50` to `brand-900` (blues, primary is `brand-500` #3b82f6), `surface` whites/grays. Font: `Inter`. Shadows: `shadow-soft` (0 4px 20px -2px rgba(0, 0, 0, 0.05)), `shadow-glow` (0 0 20px rgba(59, 130, 246, 0.5)). Use rounded corners (`rounded-lg` to `rounded-2xl`).

### 2. Deep Technical Analysis (Current State)
- The backend is a cohesive Spring Boot application (`AlenaBackendApplication.java`). Security uses `JwtAuthenticationFilter` and `JwtService` localized within the `user.security` package.
- The frontend strictly uses Standalone components. Routing is in `app.routes.ts` with lazy loading. API communication layers are in `core/services/` (e.g., `ai.service.ts`, `course.service.ts`).
- Infrastructure uses `docker-compose.yml` for PostgreSQL and Redis.

### 3. Gap Analysis (Missing Features to Implement)
We must implement the following features to reach our initial release goals:
1.  **Social Login Integration (Google/Facebook):** Currently only supports email/password. Need to integrate Spring Security OAuth2 Client in backend and add UI buttons/handling in frontend. Update `User` entity. (Priority: High)
2.  **Subscription & Payment Management:** Completely missing. Need a `payment` package in backend. Integrate a payment gateway (e.g., Stripe SDK). Create `Subscription` and `PaymentTransaction` entities. Build frontend subscription selection, checkout, and admin revenue dashboard. (Priority: High)
3.  **Robust Cheating Detection:** The frontend has placeholders, but no logic. Need backend heuristics/AI for unusual quiz behavior and frontend browser focus tracking during quizzes. (Priority: High)
4.  **Peer Tutoring Matching System:** Frontend has hardcoded placeholders in `immersive-hub`. Need a matching algorithm in a new `collaborative` package on the backend using WebSockets/STOMP. Frontend needs dynamic user fetching and WebRTC/signaling for real-time voice/chat. (Priority: Medium)
5.  **Automated Data Backups:** Missing daily automated data backups (`pg_dump`) to secure cloud storage. (Priority: High)

---

### YOUR TASK & REQUIRED DELIVERABLES:

Based on the rigorous constraints of the existing architecture (Modular Monolith, Angular Standalone, specific UI themes), provide a Master Execution Plan. Format your response clearly with Markdown. Do not give generic advice; give concrete technical specifications.

Please provide:

**Part 1: Database Schema & Domain Modeling**
- Define the exact new JPA Entities required for the missing features (e.g., `Subscription`, `PaymentTransaction`, `PeerSession`, `CheatFlag`).
- Detail the exact fields, relationships (e.g., `@OneToMany`, `@ManyToOne`), and constraints. How will the existing `User` entity be modified to support OAuth2 without breaking the existing JWT email/password flow?

**Part 2: API Contract Design (REST & WebSockets)**
- List the new REST endpoints (URLs, HTTP Methods) required for Auth, Payments, and Cheating Detection.
- Define the WebSocket/STOMP topics and message payload structures needed for the Peer Tutoring Matching System.

**Part 3: Backend Implementation Plan (Spring Boot 3)**
- Provide a step-by-step roadmap for implementing:
  1. OAuth2 integration alongside the existing JWT stateless filter.
  2. The `payment` domain package (Stripe integration strategy).
  3. The cheating detection logic within the `assessment` package.
  4. The WebSocket configuration and matching logic in a new `collaborative` package.
- Detail which specific classes, controllers, and services need to be created or modified.

**Part 4: Frontend Implementation Plan (Angular 17+)**
- Provide a step-by-step roadmap for implementing:
  1. The new standalone components needed (e.g., `subscription-plans`, `checkout`, `admin-revenue`).
  2. Updates to existing features (e.g., modifying `auth` for social login, updating `adaptive-assessment` to track window blur/focus events for cheating detection, updating `immersive-hub` to connect to WebSockets).
  3. New services required in `core/services` (e.g., `payment.service.ts`, `collaborative.service.ts`).
- Remind yourself of the Tailwind UI/UX rules and explain how the new components will adhere to the `brand` colors and `shadow-soft`/`shadow-glow` classes.

**Part 5: DevOps & Backup Strategy**
- Provide a concrete script or Docker-based strategy to fulfill the "Automated Data Backups" requirement (e.g., a sample bash script using `pg_dump` and AWS CLI/gsutil running on a cronjob).

Please ensure your response is extremely comprehensive, as this will serve as the architectural blueprint for the rest of the project's development. Take a deep breath and think step-by-step.
