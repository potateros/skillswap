# SkillSwap Backend - TypeScript Express API

## 🚀 Overview

The SkillSwap backend is a robust, production-ready TypeScript Express API that powers the peer-to-peer skill exchange platform. Built with modern best practices, it provides secure authentication, comprehensive skill management, and real-time user interactions.

## 🏗️ Architecture

### Technology Stack
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js with comprehensive middleware
- **Database**: PostgreSQL with TypeORM
- **Authentication**: bcrypt password hashing
- **Validation**: class-validator with DTO pattern
- **Security**: Helmet, CORS, rate limiting, input sanitization
- **Logging**: Winston with structured logging
- **Error Handling**: Centralized error management

### Project Structure
```
backend/
├── src/                        # TypeScript source code
│   ├── entities/              # TypeORM database entities
│   │   ├── User.ts           # User authentication & profiles
│   │   ├── Skill.ts          # Global skills registry
│   │   ├── SkillCategory.ts  # Skill categorization
│   │   ├── UserSkill.ts      # User-skill relationships
│   │   ├── SkillExchangeRequest.ts  # Exchange requests
│   │   └── UserReview.ts     # Rating & feedback system
│   ├── services/             # Business logic layer
│   │   ├── UserService.ts    # User management logic
│   │   └── SkillService.ts   # Skill management logic
│   ├── routes/               # API route handlers
│   │   ├── users.ts          # User & authentication endpoints
│   │   └── skills.ts         # Skill management endpoints
│   ├── middleware/           # Express middleware
│   │   ├── validation.ts     # Input validation middleware
│   │   ├── errorHandler.ts   # Error handling & logging
│   │   └── security.ts       # Security middleware
│   ├── dto/                  # Data Transfer Objects
│   │   ├── UserDTO.ts        # User validation schemas
│   │   ├── UserSkillDTO.ts   # Skill validation schemas
│   │   └── SkillExchangeRequestDTO.ts  # Request validation
│   ├── config/               # Configuration
│   │   └── database.ts       # TypeORM configuration
│   ├── utils/                # Utility functions
│   │   └── logger.ts         # Winston logging setup
│   ├── scripts/              # Database scripts
│   │   └── seedDatabase.ts   # TypeScript seeding script
│   └── server.ts             # Application entry point
├── logs/                     # Application logs
│   ├── error.log            # Error-level logs
│   └── combined.log         # All logs
├── dist/                    # Compiled JavaScript (after build)
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies & scripts
└── .env                    # Environment variables
```

## 🔐 Security Features

### Authentication & Authorization
- **Password Hashing**: bcrypt with 12 salt rounds
- **Input Validation**: Comprehensive validation with class-validator
- **Rate Limiting**: 
  - General endpoints: 100 requests per 15 minutes
  - Authentication endpoints: 5 requests per 15 minutes

### Security Headers & Protection
- **Helmet.js**: XSS, CSRF, and clickjacking protection
- **CORS**: Configured for specific frontend origins
- **Content Security Policy**: Prevents code injection
- **Input Sanitization**: Automatic trimming and sanitization
- **SQL Injection Prevention**: TypeORM parameterized queries

### Error Handling
- **Structured Logging**: Winston with different log levels
- **Error Classification**: Operational vs programming errors
- **Information Hiding**: No sensitive data in error responses
- **Environment-aware**: Different error details for dev vs production

## 🗄️ Database Schema

### Core Entities

#### Users
```typescript
- id: number (Primary Key)
- email: string (Unique, validated)
- password: string (bcrypt hashed)
- name: string (optional)
- bio: text (optional)
- location: string (optional)
- avatar_url: string (optional)
- time_credits: number (default: 10)
- created_at: timestamp
- updated_at: timestamp
```

#### Skills & Categories
```typescript
// SkillCategory
- id: number (Primary Key)
- name: string (Unique)
- description: text
- created_at: timestamp

// Skill
- id: number (Primary Key)
- name: string (Unique)
- description: text
- category_id: number (Foreign Key)
- created_at: timestamp
```

#### UserSkills (Many-to-Many)
```typescript
- id: number (Primary Key)
- user_id: number (Foreign Key)
- skill_id: number (Foreign Key)
- type: enum ('offer' | 'seek')
- proficiency_level: enum ('beginner' | 'intermediate' | 'advanced' | 'expert')
- years_experience: number (optional)
- description: text (optional)
- created_at: timestamp
- UNIQUE(user_id, skill_id, type)
```

#### SkillExchangeRequests
```typescript
- id: number (Primary Key)
- requester_id: number (Foreign Key)
- provider_id: number (Foreign Key)
- skill_offered_id: number (Foreign Key, optional)
- skill_requested_id: number (Foreign Key)
- message: text (optional)
- status: enum ('pending' | 'accepted' | 'declined' | 'completed')
- credits_offered: number (default: 1)
- created_at: timestamp
- updated_at: timestamp
```

## 🚦 API Endpoints

### Authentication
```typescript
POST /api/users/login
  Body: { email: string, password: string }
  Response: User object (without password)
  Rate Limited: 5 requests/15min

POST /api/users
  Body: { email: string, password: string, name?: string, bio?: string, location?: string }
  Response: User object (without password)
  Rate Limited: 5 requests/15min
```

### User Management
```typescript
GET /api/users
  Response: User[] (without passwords)
  
GET /api/users/:userId
  Response: User object
  
PUT /api/users/:userId
  Body: { name?: string, bio?: string, location?: string }
  Response: Updated User object
```

### Skills Management
```typescript
GET /api/skills
  Response: Skill[] with category information
  
GET /api/skills/categories
  Response: SkillCategory[]
  
GET /api/skills/by-category/:categoryId
  Response: Skill[] for specific category
```

### User Skills
```typescript
GET /api/users/:userId/skills
  Response: UserSkill[] with skill and category information
  
POST /api/users/:userId/skills
  Body: { skillName: string, type: 'offer'|'seek', proficiencyLevel?: string, yearsExperience?: number, description?: string }
  Response: Created UserSkill object
```

### Search
```typescript
GET /api/users/search/by-skill?skillName=...&type=...
  Query: skillName (required), type (optional: 'offer'|'seek')
  Response: SearchResult[] with user and skill information
```

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database
- TypeScript knowledge

### Setup
```bash
# Install dependencies
npm install

# Environment setup
cp .env.example .env
# Edit .env with your database configuration

# Development server (with hot reload)
npm run dev

# TypeScript compilation
npm run build

# Production server
npm start
```

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/skill_exchange

# Server
PORT=3000
NODE_ENV=development

# Security
FRONTEND_URL=http://localhost:5173

# Logging
LOG_LEVEL=info
```

### Available Scripts
```bash
npm run dev           # Development with hot reload (ts-node)
npm run dev:watch     # Development with nodemon + ts-node
npm run build         # Compile TypeScript to JavaScript
npm start            # Run compiled JavaScript (production)
npm run db:seed-ts   # Seed database with TypeScript script
npm run db:seed      # Legacy JavaScript seed script
npm run lint         # Code linting (placeholder)
```

### Database Seeding
```bash
# Comprehensive seeding with 100 skills across 10 categories
npm run db:seed-ts

# Legacy seeding (JavaScript)
npm run db:seed

# Skills-only population
npm run db:populate-skills
```

## 🧪 Testing

### Manual Testing
```bash
# Health check
curl http://localhost:3000/api/health

# User registration
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# User login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get all skills
curl http://localhost:3000/api/skills

# Search users by skill
curl "http://localhost:3000/api/users/search/by-skill?skillName=JavaScript&type=offer"
```

### Automated Testing
```bash
# TODO: Add test framework
npm test
```

## 📊 Logging & Monitoring

### Log Levels
- **error**: Error conditions
- **warn**: Warning conditions
- **info**: Informational messages
- **debug**: Debug-level messages

### Log Files
- `logs/error.log`: Error-level logs only
- `logs/combined.log`: All log levels
- Console output in development

### Log Format
```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "level": "info",
  "message": "User created successfully",
  "service": "skillswap-backend",
  "userId": 123,
  "email": "user@example.com"
}
```

## 🚀 Deployment

### Production Build
```bash
# Build TypeScript
npm run build

# Start production server
NODE_ENV=production npm start
```

### Docker Deployment
```bash
# Build Docker image
docker build -t skillswap-backend .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e NODE_ENV=production \
  skillswap-backend
```

### Environment Configuration
```bash
# Production environment variables
DATABASE_URL=postgresql://prod_user:prod_pass@prod_host:5432/skill_exchange
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
LOG_LEVEL=warn
```

## 🔧 Performance Considerations

### Database Optimization
- **Indexes**: Optimized for search queries
- **Connection Pooling**: TypeORM connection management
- **Query Optimization**: Efficient joins for user-skill searches

### Caching Strategy
- **Future Enhancement**: Redis for session management
- **Future Enhancement**: Query result caching

### Rate Limiting
- **Authentication**: 5 requests per 15 minutes per IP
- **General API**: 100 requests per 15 minutes per IP
- **Configurable**: Environment-based rate limit configuration

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check PostgreSQL is running
docker-compose ps

# Check connection string
echo $DATABASE_URL

# Reset database
docker-compose down -v && docker-compose up -d
```

#### TypeScript Compilation Errors
```bash
# Clear TypeScript cache
rm -rf dist/ node_modules/.cache/

# Reinstall dependencies
rm -rf node_modules/ package-lock.json
npm install
```

#### Port Conflicts
```bash
# Check what's using port 3000
lsof -i :3000

# Change port in .env
PORT=3001
```

### Debug Mode
```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev

# TypeScript debugging with source maps
node --inspect-brk dist/server.js
```

## 📈 Metrics & Health Checks

### Health Check Endpoint
```bash
GET /api/health
Response: {
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Application Metrics
- Request count and response times
- Database connection status
- Error rates by endpoint
- User registration and activity metrics

## 🔮 Future Enhancements

### Immediate Improvements
- [ ] JWT token-based authentication
- [ ] API versioning (/api/v1/)
- [ ] Request/response caching
- [ ] Database migrations system
- [ ] Comprehensive test suite

### Advanced Features
- [ ] Real-time features with WebSockets
- [ ] Email notification service
- [ ] File upload handling (avatars)
- [ ] Background job processing
- [ ] API documentation with OpenAPI/Swagger

### Infrastructure
- [ ] Kubernetes deployment configs
- [ ] CI/CD pipeline setup
- [ ] Monitoring with Prometheus/Grafana
- [ ] Database backup automation
- [ ] Load balancing configuration

---

**Built with TypeScript ❤️ and modern best practices for production-ready applications.**