# Fahmak Alena - Project Context & AI Instructions

## 1. Project Overview
- **Name:** Fahmak Alena
- **Description:** An AI-Powered Educational Platform featuring personalized learning paths, adaptive assessments, gamification, and specialized dashboards for Students, Instructors, and Administrators.
- **Goal:** To provide a comprehensive, interactive, and intelligent learning environment.

## 2. Technology Stack
**Frontend:**
- **Framework:** Angular 17+ (Using Standalone Components API, no NgModules)
- **Styling:** Tailwind CSS
- **State Management/Core:** TypeScript, HTML, CSS, RxJS, Angular Services
- **Architecture Features:** Feature-first modular structure with Standalone Components.

**Backend:**
- **Framework:** Spring Boot 3.x (Java 17)
- **Database:** PostgreSQL (production/target), H2 (in-memory for development)
- **Caching/Data:** Redis
- **Security:** Spring Security, JWT (Role-based access)
- **AI Integration:** Google Gemini / Vertex AI API

**Architecture:**
- **Backend:** Modular Monolithic Architecture. The system is divided logically into distinct packages representing core domains rather than separate physical microservices. Implemented domains include:
  - `admin`, `ai`, `assessment`, `course`, `gamification`, `instructor`, `notification`, `user`.
- **Frontend:** Feature-first Standalone Architecture. The frontend uses a highly modular structure divided into features:
  - `accessibility-preferences`, `achievements`, `adaptive-assessment`, `admin-dashboard`, `ai-chat`, `auth`, `course-details`, `immersive-hub`, `instructor-dashboard`, `landing`, `leaderboard`, `library`, `student-dashboard`, `virtual-classroom`.
  - Shared components like `header` and `sidebar`.
  - Core services, guards, interceptors, and models.

## 3. UI/UX Design System & Theme
When generating new frontend components or pages, strictly adhere to the following Tailwind CSS configuration and design principles:

**Typography:**
- **Primary Font:** `Inter`, sans-serif
- **General Styling:** `text-gray-900 bg-gray-50 antialiased` (Defined in global `index.html`)

**Color Palette:**
- **Brand Colors (Blues):**
  - `brand-50`: `#eff6ff`
  - `brand-100`: `#dbeafe`
  - `brand-500`: `#3b82f6` (Primary Brand Color)
  - `brand-600`: `#2563eb` (Hover states)
  - `brand-900`: `#1e3a8a` (Dark text/accents)
- **Surface Colors (Whites/Grays):**
  - `surface`: `#ffffff` (Default background for cards/containers)
  - `surface-50`: `#f8fafc`
  - `surface-100`: `#f1f5f9`
  - `surface-200`: `#e2e8f0`

**Effects & Shadows:**
- `shadow-soft`: `0 4px 20px -2px rgba(0, 0, 0, 0.05)` (Use for soft floating cards and containers to give a modern depth)
- `shadow-glow`: `0 0 20px rgba(59, 130, 246, 0.5)` (Use for glowing interactive elements, primary buttons, or active states)

**Design Principles:**
- **Modern & Clean:** Use plenty of whitespace, rounded corners (e.g., `rounded-lg`, `rounded-xl`, `rounded-2xl`), and the `shadow-soft` class to create a premium, glassmorphic or highly polished feel.
- **Component Based:** Build reusable UI components rather than duplicating layouts.
- **Responsive:** Always use Tailwind's responsive utility variants (`sm:`, `md:`, `lg:`, `xl:`) to ensure perfect layout across mobile, tablet, and desktop screens.

## 4. Coding Conventions & Best Practices
**Frontend (Angular):**
- Strictly use **Standalone Components** (`standalone: true`). Do not generate or suggest `NgModule` based configurations.
- Use `app.routes.ts` for routing configurations.
- Keep component `.ts` files focused on logic and use `.html` templates for structure.
- Style strictly with Tailwind utility classes in the HTML. Avoid writing custom CSS in stylesheets unless absolutely necessary.
- Use feature-specific services placed in `core/services` for state and data management.

**Backend (Spring Boot):**
- Use Lombok annotations (`@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@Builder`, etc.) to reduce boilerplate code.
- Follow standard layered architecture within each domain package: `Controllers` -> `Services` -> `Repositories`.
- Keep entities within their respective domain packages (e.g., `Assessment`, `Course`, `User`).
- Secure API endpoints using Spring Security, JWT interceptors, and role-based access.
- Ensure database interactions are optimized, utilizing Spring Data JPA.

## 5. Instructions for AI Assistants
When asked to write code, design new pages, or add features to "Fahmak Alena", you must act as if you were the original author by following these rules:
1. **Match the Style:** Always use the defined `brand` and `surface` color palettes, along with the `Inter` font and custom shadows from the Tailwind config. Do not use generic colors when custom brand colors are available.
2. **Contextual Awareness:** Remember the distinct roles (Student, Instructor, Admin) and tailor the UI, wording, and logic accordingly.
3. **Integration:** If adding new backend features, structure them as new packages within the monolithic architecture following the existing `controller/service/repository` pattern.
4. **Consistency:** Write modern, clean, and robust code matching Angular 17+ (Standalone) and Spring Boot 3+ standards. Always verify that the generated code aligns with the overall "Fahmak Alena" vision of being a cutting-edge, AI-powered educational platform.
