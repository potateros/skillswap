# SkillSwap - P2P Skill Exchange Platform

## Overview

SkillSwap is a peer-to-peer skill exchange platform that connects people to teach and learn skills within their communities. Built with modern web technologies, it enables users to offer skills they know and find others to learn from, creating a community-driven learning ecosystem.

## Key Features

- **User Authentication**: Secure registration/login with bcrypt password hashing
- **Skill Portfolio**: Users can offer skills (with proficiency levels) and seek skills to learn
- **Skill Discovery**: Search by skill name, browse 100+ skills across 10 categories
- **Connection Requests**: Send/receive skill exchange requests with messaging
- **Time Banking**: Credit system foundation for skill exchanges
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Backend**: TypeScript + Express + PostgreSQL + TypeORM
- **Frontend**: React 19 + Vite + Tailwind CSS
- **Security**: bcrypt, Helmet, CORS, rate limiting, input validation
- **DevOps**: Docker + Docker Compose, multi-stage builds
- **Logging**: Winston structured logging

## Setup Instructions

### Prerequisites
- Node.js 18+ & npm
- Docker & Docker Compose
- Git

### Quick Start
```bash
# 1. Clone repository
git clone <repository-url> skillswap
cd skillswap

# 2. Start database
docker-compose -f docker-compose.db.yml up -d

# 3. Setup backend
cd backend
cp .env.example .env
npm install
npm run dev &    # Runs at http://localhost:3000

# 4. Seed database (recommended)
npm run db:seed-ts

# 5. Setup frontend (new terminal)
cd ../frontend
npm install
npm run dev      # Opens at http://localhost:5173
```

### Full Docker Setup (Alternative)
```bash
# Run everything in Docker
docker-compose up -d
# Access at http://localhost:5173
```

## Architecture Decisions

### Key Design Choices
- **TypeScript**: Ensures type safety and better developer experience
- **TypeORM**: Provides robust database abstraction with entity relationships
- **bcrypt**: Industry standard for password hashing (12 salt rounds)
- **Rate Limiting**: Prevents abuse (5 auth requests, 100 general requests per 15min)
- **Service Layer**: Separates business logic from API routes
- **DTO Validation**: Comprehensive input validation with class-validator
- **Multi-stage Docker**: Optimized production builds with security best practices

### Database Design
- **Skills as Global Registry**: Prevents duplication, enables skill discovery
- **User-Skill Many-to-Many**: Flexible relationship with offer/seek types
- **Time Credits**: Foundation for future skill exchange economy
- **Proficiency Levels**: Enables skill matching by experience level
