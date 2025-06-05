# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SkillSwap is a Peer-to-Peer Skill Exchange Platform POC that connects users to share skills within their communities. The application consists of a React frontend and Node.js/Express backend with PostgreSQL database.

### **Background**

In today's fast-paced world, continuous learning is essential, but traditional education can be expensive and inflexible. Meanwhile, many skilled individuals have expertise they could share but lack a platform to connect with potential learners. The gig economy has shown that people are willing to participate in peer-to-peer exchanges, but current platforms focus mainly on monetary transactions rather than skill exchange.

### **The Problem**

Many people want to learn new skills but face barriers such as high costs of formal education, inflexible schedules, and difficulty finding local experts. Simultaneously, there are skilled individuals who would enjoy teaching others but lack a convenient platform to connect with learners. Traditional learning platforms often focus on one-way, monetized teaching, missing the opportunity for mutual skill exchange and community building.

### **The Solution**

We propose to develop a Peer-to-Peer Skill Exchange Platform. This platform will facilitate the matching of people based on the skills they can teach and want to learn, enabling direct skill swaps within communities. By creating a time-banking system and community-driven platform, we aim to make skill exchange as accessible as possible while building local learning communities.

### **Objective**

Your mission is to develop a POC for the P2P Skill Exchange Platform. This POC should demonstrate the platform's core functionality and its potential to create meaningful connections between teachers and learners. You are free to define the core features and use cases based on your understanding of the problem and the market. There are no restrictions on the features you want to provide, some examples would be User Profiles, Skill Matching, Time Banking, Community Features, or AI-Enhanced Learning Paths.There are also no technical requirement restrictions on the solution you provide, whether it is a web app, mobile app, or just an REST API platform without a frontend (e.g. all your customers know how to write curl), or any other type of technical solutions you can think of.

The goal here is to build an ACTUAL POC to solve the problem mentioned above, so don’t just treat it as a coding skill test. The use of available open-source solutions, tools, and technologies, including GPT, is highly recommended to accelerate development and add innovative features.

You are not expected to build a perfect product, which is also not possible given the limited time. So, choose the right feature to start with, while keeping your future plan in mind.

### **Evaluation Criteria**

- **Functionality:** The POC should work properly as per your defined user journey.
- **Code Quality and Structure:** Clean, maintainable code with a well-architected structure.
- **Proper Prioritization:** Demonstrated ability to prioritize features and tasks effectively, focusing on what truly matters for a POC to test market fit.
- **Innovation:** Incorporation of unique features or functionalities that demonstrate creativity and forward-thinking in addressing the problem at hand.
- **Use of Tools and Technologies:** Effective use of available tools, technologies, and solutions to accelerate development and add value.

### **Submission Guidelines**

- Provide access to the source code via a GitHub repository.
- Include a README with comprehensive setup instructions, an overview of the project, key features, and any decisions worth noting. Also include a project plan and milestone for your future extension.

### Architecture

- **Frontend**: React (Vite) with Tailwind CSS at `/frontend`
- **Backend**: Node.js/Express REST API at `/backend`
- **Database**: PostgreSQL (runs in Docker container)
- **Development**: Uses Docker Compose for database, local development servers for frontend/backend

### Core Data Model

- `users` table: User profiles with email, password (plaintext in POC), name, bio
- `skills` table: Global skills registry with unique skill names
- `user_skills` table: Many-to-many relationship linking users to skills with type ('offer' or 'seek')

## Development Commands

### Database Setup
```bash
# Start PostgreSQL database
docker-compose up -d

# Seed database with sample data
cd backend && npm run db:seed
```

### Backend Development
```bash
cd backend
npm install
npm run dev        # Start with nodemon (auto-restart)
npm start         # Start without auto-restart
```
Backend runs on http://localhost:3000

### Frontend Development
```bash
cd frontend
npm install
npm run dev       # Start Vite dev server
npm run build     # Build for production
npm run lint      # Run ESLint
```
Frontend runs on http://localhost:5173 with API proxy to backend

### Full Application
```bash
# Terminal 1: Start database
docker-compose up -d

# Terminal 2: Start backend
cd backend && npm run dev

# Terminal 3: Start frontend
cd frontend && npm run dev
```

## Key API Endpoints

- `GET /api/users` - List all users
- `POST /api/users` - Register new user
- `GET /api/users/:userId/skills` - Get user's skills
- `POST /api/users/:userId/skills` - Add skill to user (offer/seek)
- `GET /api/users/search/by-skill` - Search users by skill name with optional type filter
- `GET /api/skills` - List all skills
- `POST /api/skills` - Add new skill

## Development Notes

- Database schema auto-initializes on backend startup
- Frontend uses Vite proxy for `/api` requests to backend
- Passwords stored in plaintext (POC only - not production ready)
- No authentication system implemented yet
- Uses PostgreSQL connection pooling in backend routes
- Frontend processes search results into user objects with skill arrays
