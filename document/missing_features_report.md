# Fahmak Alena - Gap Analysis & Missing Features Report

## Overview
This report highlights the discrepancies between the official documentation (`Fahmak_Alena_User_Stories.pdf` and `Fahmak_Alena_System_Analysis_Design_Document_Golden_Balanced.pdf`) and the currently implemented codebase. 

Through deep analysis of both the Angular Frontend and Spring Boot Backend, several "In-Scope" features and Non-Functional Requirements are currently missing and require development to meet the initial release goals.

---

## 1. Missing Core Functional Requirements

### 1.1 Social Login Integration (Google/Facebook)
- **Reference:** User Story FR-UM-001 ("register and log in ... using social accounts"). Priority: **High**.
- **Current State:** `AuthController.java` and frontend auth components only support standard email/password registration and authentication.
- **Action Required:** 
  - **Backend:** Integrate Spring Security OAuth2 Client. Create endpoints for Google/Facebook callbacks. Update `User` entity to support OAuth providers.
  - **Frontend:** Add Google/Facebook login buttons to the Auth UI and handle OAuth2 redirects and token exchanges.

### 1.2 Subscription & Payment Management
- **Reference:** User Story FR-MO-001 ("support various subscription plans and securely process payments"). Priority: **High** (8 pts for admin, 5 pts for payment processing).
- **Current State:** Completely missing. No `payment` package in backend. No subscription management UI for admins or students.
- **Action Required:**
  - **Backend:** Create a `payment` package. Integrate a payment gateway (e.g., Stripe SDK). Create `Subscription` and `PaymentTransaction` entities.
  - **Frontend:** Build subscription plan selection UI, checkout process, and an Admin dashboard section for revenue and subscription management.

### 1.3 Robust Cheating Detection
- **Reference:** Instructor User Story ("utilize robust cheating detection mechanisms for assessments"). Priority: **High** (8 pts).
- **Current State:** The UI (`instructor-dashboard`) has static text placeholders for cheating detection, but there is zero backend logic (no webcam monitoring, browser locking, or anomaly detection).
- **Action Required:**
  - **Backend:** Implement heuristics or AI models to flag unusual quiz behavior (time taken, rapid switching). 
  - **Frontend:** Implement browser focus tracking (blur/focus events) during quizzes and report to backend.

### 1.4 Peer Tutoring Matching System
- **Reference:** Student Collaborative Learning User Story ("use a Peer Tutoring Matching System"). Priority: **Medium** (5 pts).
- **Current State:** The `immersive-hub.component.html` contains hardcoded HTML placeholders ("Seif, Amr - Lvl Expert") simulating a voice group matching system. No actual backend exists.
- **Action Required:**
  - **Backend:** Create a matching algorithm in a new `collaborative` package. Requires WebSockets/STOMP for real-time presence.
  - **Frontend:** Implement dynamic user fetching, WebRTC or signaling for real-time voice/chat integration.

---

## 2. Missing Non-Functional Requirements

### 2.1 Automated Data Backups
- **Reference:** System User Story ("perform daily automated data backups with a clear disaster recovery plan"). Priority: **High** (5 pts).
- **Current State:** No automated backup scripts (`pg_dump` cronjobs) or disaster recovery plans (DRP) exist in the codebase.
- **Action Required:** 
  - DevOps implementation: Write a shell script or Docker container that runs `pg_dump` daily and uploads the payload to a secure cloud storage bucket (e.g., AWS S3, Google Cloud Storage).

---

## 3. Partially Implemented Features

### 3.1 Immersive Learning (AR/VR)
- **Reference:** Student User Story ("access basic AR/VR integrated learning modules"). Priority: **Medium** (8 pts).
- **Current State:** Implemented via embedding 3rd party Sketchfab iframes in `immersive-hub`. While this satisfies "Basic 3D Models", true AR/VR interactive modules tied to student progress might require deeper native WebGL integration in the future.

## Conclusion
To align the project with its System Analysis documentation for the "Initial Release", the development team should prioritize **OAuth2 Integrations**, the **Payment Gateway**, and **Backend Security/Cheating Detection Logic**, as these carry the highest impact for go-live readiness.
