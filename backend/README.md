# SkillSwap Backend

## Overview
Production-ready TypeScript Express API for the peer-to-peer skill exchange platform. Features secure authentication, skill management, and user connections.

## Tech Stack
- **TypeScript + Express.js** - API framework
- **PostgreSQL + TypeORM** - Database and ORM
- **bcrypt** - Password hashing
- **class-validator** - Input validation
- **Winston** - Structured logging
- **Helmet + CORS** - Security middleware

## Development Setup
```bash
# Install dependencies
npm install

# Environment setup
cp .env.example .env

# Start development server
npm run dev
# Runs at http://localhost:3000
```

## Available Scripts
- `npm run dev` - Development with hot reload
- `npm run build` - Compile TypeScript
- `npm start` - Run production build
- `npm run db:seed-ts` - Seed database with sample data

## Key Features
- User authentication with bcrypt password hashing
- Skill management with categories and proficiency levels
- User skill portfolio (offer/seek skills)
- Connection requests between users
- Comprehensive input validation and security
- Structured logging and error handling

## Architecture
- **Entities**: TypeORM models for Users, Skills, Categories, UserSkills, ExchangeRequests
- **Services**: Business logic layer for user and skill management
- **Routes**: RESTful API endpoints with validation middleware
- **Security**: Rate limiting, CORS, input sanitization, SQL injection prevention

## Database Schema
- **Users**: Authentication, profiles, time credits
- **Skills/Categories**: 100+ skills across 10 categories
- **UserSkills**: Many-to-many with offer/seek types and proficiency levels
- **ExchangeRequests**: Connection requests between users

## Key API Endpoints
- `POST /api/users/login` - User authentication
- `POST /api/users` - User registration
- `GET /api/users/search/by-skill` - Search users by skill
- `POST /api/users/:id/skills` - Add skills to user profile
- `GET /api/skills/categories` - Browse skill categories