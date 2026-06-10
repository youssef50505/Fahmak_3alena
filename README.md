# Fahmak 3alena

A modern learning platform with AI-driven features, adaptive assessments, and immersive video classrooms.

## 🚀 Quick Start Guide

To run this project on your local machine, you will need:
1. **Java 17** or higher
2. **Node.js** (v18+)

### Step 1: Start the Backend (Spring Boot)
Open a terminal in the `backend` folder and run:
```bash
cd backend
./mvnw spring-boot:run
```
*(The backend runs on `http://localhost:8080`. It uses an in-memory H2 database, so no external database setup is required!)*

### Step 2: Start the Frontend (Angular)
Open a new terminal in the `frontend` folder and run:
```bash
cd frontend
npm install
npm start
```
*(The frontend runs on `http://localhost:4200`)*

---

### ⚙️ Environment Variables (Optional)
To enable AI features, set your Groq/OpenAI API key in your environment before starting the backend:
**Windows (PowerShell):**
```powershell
$env:OPENAI_API_KEY="your-api-key"
```
**Mac/Linux:**
```bash
export OPENAI_API_KEY="your-api-key"
```

---

### 🔑 Default Test Accounts
When the backend starts, it automatically seeds the in-memory database with the following test accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Student** | `omar.student@fahmak.com` | `password123` |
| **Instructor** | `ahmed.instructor@fahmak.com` | `password123` |
| **Admin** | `admin@fahmak.com` | `password123` |
