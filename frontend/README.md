# Fahmak Alena - Frontend Application

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.17.
It serves as the main interactive user interface for the **Fahmak Alena** AI-powered educational platform.

## Architecture

The frontend follows a **Feature-First Standalone Architecture**. We do not use NgModules; instead, everything is a `Standalone Component`.
- **UI Framework:** Angular 17+
- **Styling:** Tailwind CSS (configured with brand colors in `tailwind.config.js`)
- **Animations:** GSAP (GreenSock Animation Platform) is heavily used for micro-animations, transitions, and modern UI interactions.
- **Routing:** Configured centrally in `app.routes.ts` with lazy loading for all major feature components.
- **State & Data:** Angular Services (`core/services/`) act as the single source of truth for communicating with the Spring Boot backend via REST APIs. Data transfer objects are defined in `core/models/`.

## Key Features
- **Student & Instructor Dashboards:** Personalized views based on user roles (JWT protected).
- **Course Management:** Instructors can fully manage their courses (`/instructor/courses`).
- **Instructor Integrity Dashboard:** Review flagged student sessions and cheat events detected by the AI (`/instructor/integrity`).
- **Profile Settings:** Update personal user info and preferences (`/profile`).
- **Immersive Hub & Virtual Classroom:** WebRTC/ZegoCloud powered immersive classrooms.
- **AI Chat & Adaptive Assessments:** Direct integration with Groq/Vertex AI via the backend.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name --standalone` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
