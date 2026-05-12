# Polytechnic College Placement Portal

A modern, full-stack placement management system designed for polytechnic colleges.

## Features

- **Role-Based Portals**: Custom experiences for Students, Recruiters, and Admin/TPOs.
- **Smart Job Matching**: Automatic eligibility filtering based on CGPA, branch, and skills.
- **AI-Powered Insights**:
  - **Resume Analyzer**: Instant feedback on resume text, detecting skills and suggesting improvements.
  - **Job Recommendations**: AI-driven matching between student profiles and available job listings.
- **Real-Time Notifications**: Instant updates on application status and new job postings via Socket.io.
- **Interactive Dashboards**: Data visualizations for placement analytics and personal progress.
- **Modern UI**: Built with React, Tailwind CSS, and Framer Motion for a fluid, polished experience.

## Tech Stack

- **Frontend**: React, Tailwind CSS, Recharts, Lucide Icons, Framer Motion.
- **Backend**: Node.js, Express, Socket.io, JSON Web Tokens (JWT).
- **AI**: Gemini 1.5 Flash (via @google/genai).

## Setup & Running Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file based on `.env.example`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   JWT_SECRET=your_jwt_secret
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

## Default Credentials (Demo)

- **Admin**: `admin@college.edu` / `admin123`
- **Student**: `john@student.edu` / `student123`

## Directory Structure

- `server.ts`: Express backend server with API and Socket logic.
- `src/pages/`: Main application views (Dashboard, Jobs, Profile, Auth).
- `src/services/`: API, Socket, and AI service integrations.
- `src/context/`: Authentication state management.
- `src/components/`: Reusable UI components.
