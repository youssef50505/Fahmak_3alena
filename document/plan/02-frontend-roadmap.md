# Frontend Roadmap & Architecture

This document details the frontend architecture and development roadmap for the **Fahmak Alena** Angular application.

## 1. Architectural Principles

*   **Framework:** Angular 17+
*   **Pattern:** Modular and Standalone Components. We prioritize standalone components for newer features to reduce `NgModule` boilerplate, while maintaining feature modules for logical grouping and lazy loading.
*   **Styling:** Tailwind CSS. We strictly use utility classes in HTML and adhere to the project's custom `brand` color palette and defined shadows.

## 2. Directory Structure

```
src/
└── app/
    ├── core/          # Singletons, interceptors, auth guards, services
    ├── shared/        # Reusable UI components (buttons, cards, inputs), pipes, directives
    └── features/      # Feature modules/components (lazy loaded)
        ├── auth/      # Login, Register
        ├── landing/   # Public facing landing page
        ├── student-dashboard/
        ├── instructor-dashboard/
        ├── admin-dashboard/
        ├── virtual-classroom/
        └── adaptive-assessment/
```

## 3. State Management (NgRx)

We utilize NgRx to manage complex state across the application, adhering to the Redux pattern.

### Key State Slices:
1.  **Auth State:** Manages the current user, JWT token, and role.
2.  **Course State:** Manages the list of enrolled courses, current progress, and active modules.
3.  **Assessment State:** Tracks live quiz progress, timers, and AI-generated dynamic questions.
4.  **Gamification State:** Live points, unlocked badges, and leaderboard rankings.

## 4. Development Roadmap

### Phase 1: Core Foundation & Landing
*   [x] Setup Angular workspace and Tailwind CSS configuration.
*   [ ] Build global UI components (Navbar, Footer, Base Cards).
*   [ ] Implement high-converting, modern Landing Page.
*   [ ] Implement Auth UI (Login/Register) and basic routing guards.

### Phase 2: Student Experience
*   [ ] Build Student Dashboard (Course overview, recent activity).
*   [ ] Implement Adaptive Assessment UI.
*   [ ] Integrate Immersive Hub / Virtual Classroom basic shell.

### Phase 3: Instructor & Admin
*   [ ] Build Instructor Dashboard (Analytics, course management).
*   [ ] Build Admin Dashboard (User management, system health).

### Phase 4: Polish & Performance
*   [ ] Implement advanced animations and glassmorphic UI polish.
*   [ ] Optimize lazy loading boundaries and bundle sizes.
*   [ ] Ensure full accessibility (a11y) compliance.
