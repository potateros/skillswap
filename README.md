# SkillSwap - P2P Skill Exchange Platform

## Overview

SkillSwap is a peer-to-peer skill exchange platform that connects people to teach and learn skills within their communities. Built with modern web technologies, it enables users to offer skills they know and find others to learn from, creating a community-driven learning ecosystem with persistent authentication and comprehensive skill exchange features.

## Setup Instructions

### Install Dependencies

Frontend

```bash
cd frontend && npm install
```

Backend

```bash
cd backend && npm install
cp .env.example .env # Setup env file
```

Database

```bash
docker-compose -f docker-compose.db.yml up -d
docker ps  # Should see postgres container

# Seed DB
npm run db:seed
```

Start Frontend and Backend

```bash
cd frontend && npm run dev
cd backend && npm run dev
```

### Environment Variables

Create `.env` in backend directory (optional - defaults provided):
```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/skillswap
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=skillswap

# Server
PORT=3000
NODE_ENV=development

# Session Security
SESSION_SECRET=your-secret-key-here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

## Tech Stack

- Frontend
  - React, Vite, Tailwind, Client-side Routing
  - Cookies for session management
- Backend
  - Typescript, Express, TypeORM, PostgreSQL
  - Additional middleware for security (Helmet, rate limiting), session management
  - Docker & Docker Compose

## Project Plan & Future Milestones

- Better developer experience
  - Implement CI/CD for rapid testing and deployment
  - Add better caching (Redis)
- Improved user experience
  - JWT authentication, password reset, email verification
	- Profile photos, skill badges, activity timeline
	- Advanced search filters, AI skill suggestions
	- Save favourites
- Better communications & notifications
	- In-app messaging, real-time notifications, file sharing
	-	Calendar integration, availability display, meeting proposals, reminders
- Community and achievements/competitions?
	-	Promotional bulk pricing, history, rewards
	-	Skill groups, events, forums, mentorship programs?
	-	Achievements, leaderboards, skill challenges, progress tracking
- External partnerships?
	-	Organization accounts, team management, learning paths, certifications
	-	Multi-tenant support, rate limiting, DB optimization, CDN integration
	-	Premium/pro accounts, marketplace links, corporate partnerships
  - More fleshed-out course series?
