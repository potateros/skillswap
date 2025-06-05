# SkillSwap Backend

## Overview
Production-ready TypeScript Express API for the peer-to-peer skill exchange platform. Features persistent session authentication, comprehensive skill management, exchange request system, time banking, and user reviews.

## Tech Stack
- **TypeScript + Express.js** - API framework
- **PostgreSQL + TypeORM** - Database and ORM with entity relationships
- **Cookie-parser** - Session management via HTTP-only cookies
- **bcrypt** - Password hashing (12 salt rounds)
- **class-validator** - Comprehensive input validation with DTOs
- **Winston** - Structured logging with error tracking
- **Helmet + CORS** - Security middleware with CSRF protection

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

### 🔐 Authentication & Security
- **Persistent Sessions**: Cookie-based authentication with HTTP-only cookies
- **Session Management**: In-memory session store with automatic cleanup
- **Password Security**: bcrypt hashing with 12 salt rounds
- **Rate Limiting**: 1000 general requests, 5 auth requests per 15 minutes
- **Input Validation**: Comprehensive DTO validation with class-validator
- **CORS Protection**: Configured for frontend integration with credentials

### 🎯 Skill System
- **Skill Management**: 100+ skills across 10 categories
- **User Skill Portfolio**: Offer/seek skills with proficiency levels and experience
- **Skill Search**: Advanced search by skill name with type filtering
- **Optimized Queries**: Bulk data fetching to prevent N+1 query problems

### 💬 Exchange System
- **Exchange Requests**: Complete request lifecycle (create, view, update)
- **Status Management**: Pending, accepted, declined request states
- **Messaging**: Optional messages with exchange requests
- **Credit Integration**: Time credit offers with exchange requests

### 💰 Time Banking
- **Credit System**: Time-based currency for skill exchanges
- **Transaction Tracking**: Complete transaction history and balance management
- **Credit Operations**: Earn and spend credits through skill exchanges

### ⭐ Review System
- **User Reviews**: Rate and review skill exchange experiences
- **Reputation Building**: Track user ratings and feedback
- **Review Management**: View reviews given and received

### 🔧 Technical Features
- **TypeORM Integration**: Entity relationships and query optimization
- **Service Layer Architecture**: Clean separation of business logic
- **Error Handling**: Structured error responses with proper HTTP status codes
- **Logging**: Winston-based logging with request tracking
- **Docker Support**: Multi-stage builds for development and production

## Architecture
- **Entities**: TypeORM models for Users, Skills, Categories, UserSkills, ExchangeRequests, TimeTransactions, Reviews
- **Services**: Business logic layer with UserService, SkillService, ExchangeRequestService, TimeBankingService, ReviewService
- **Routes**: RESTful API endpoints with comprehensive validation middleware
- **Middleware**: Authentication, security (rate limiting, CORS), validation, error handling
- **DTOs**: Data transfer objects with class-validator for type-safe API contracts

## Database Schema
- **Users**: Authentication, profiles, time credits, session management
- **Skills/Categories**: 100+ skills across 10 categories with descriptions
- **UserSkills**: Many-to-many with offer/seek types, proficiency levels, and experience
- **SkillExchangeRequests**: Complete request lifecycle with status tracking and messaging
- **TimeTransactions**: Credit transaction history for time banking system
- **Reviews**: User rating and feedback system for reputation building

## Complete API Reference

### Authentication Endpoints
- `POST /api/users/login` - User login with session cookie creation
- `POST /api/users/logout` - User logout with session destruction
- `GET /api/users/me` - Get current authenticated user
- `POST /api/users` - User registration with automatic login

### User Management
- `GET /api/users` - Get all users
- `GET /api/users/with-skills` - Get all users with their skills (optimized)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/search/by-skill` - Search users by skill name

### Skill Management
- `GET /api/skills` - Get all skills
- `POST /api/skills` - Create new skill
- `GET /api/skills/categories` - Get all skill categories
- `GET /api/users/:id/skills` - Get user's skills
- `POST /api/users/:id/skills` - Add skill to user profile

### Exchange Request System
- `POST /api/users/:id/exchange-requests` - Create skill exchange request
- `GET /api/users/:id/exchange-requests` - Get user's exchange requests
- `PUT /api/users/:id/exchange-requests/:requestId` - Update request status

### Time Banking System
- `GET /api/users/:id/time-transactions` - Get user's transaction history
- `POST /api/users/:id/time-transactions` - Create time credit transaction

### Review System
- `GET /api/users/:id/reviews` - Get user's reviews (given/received)
- `POST /api/users/:id/reviews` - Submit review for skill exchange