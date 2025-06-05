# SkillSwap - P2P Skill Exchange Platform

## 🌟 Overview

SkillSwap is a comprehensive Peer-to-Peer Skill Exchange Platform that connects people to teach and learn skills within their communities. From coding to cooking, yoga to languages - there's always someone to learn from and someone to teach.

## ✨ Key Features

### 🔐 **User Management & Authentication**
- Secure user registration and login with bcrypt password hashing
- User profiles with bio, location, and time credits tracking
- Profile management and skill portfolio

### 🎯 **Skill Management System**
- **100+ Skills** across **10 Categories** (Technology, Creative Arts, Business, Wellness, etc.)
- Skill offering with proficiency levels (Beginner → Expert)
- Years of experience tracking
- Skill seeking with learning goals

### 🔍 **Advanced Search & Discovery**
- Search by skill name with type filters (Teaching/Learning)
- Category-based browsing
- Featured skills quick selection
- Real-time search results

### 🤝 **Connection & Exchange System**
- Send skill exchange requests to other users
- Accept/decline incoming requests with messaging
- Request status tracking (Pending → Accepted → Completed)
- Time banking foundation for future credit system

### 🏗️ **Production-Ready Architecture**
- **Backend**: TypeScript + Express + TypeORM + PostgreSQL
- **Frontend**: React (Vite) + Tailwind CSS
- **Security**: Input validation, rate limiting, security headers
- **Logging**: Structured logging with Winston
- **Error Handling**: Comprehensive error management

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js with security middleware
- **Database**: PostgreSQL with TypeORM
- **Authentication**: bcrypt password hashing
- **Validation**: class-validator for input validation
- **Security**: Helmet, CORS, rate limiting
- **Logging**: Winston with file and console outputs

### Frontend
- **Framework**: React 19 with TypeScript support
- **Build Tool**: Vite for fast development
- **Styling**: Tailwind CSS with responsive design
- **State Management**: React hooks and context
- **HTTP Client**: Fetch API with error handling

### DevOps
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL in Docker container
- **Development**: Hot reload for both frontend and backend
- **Build System**: TypeScript compilation and bundling

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18+) & npm
- **Docker** & Docker Compose
- **Git**

### 1. Clone & Setup
```bash
git clone <repository-url> skillswap
cd skillswap
```

### 2. Environment Configuration
```bash
# Backend environment
cd backend
cp .env.example .env
# Edit .env if needed - default configuration should work
```

### 3. Start Database
```bash
# From project root
docker-compose up -d
```

### 4. Backend Setup
```bash
cd backend
npm install
npm run dev           # TypeScript development server
```
Backend will be available at `http://localhost:3000`

### 5. Seed Database (Recommended)
```bash
# In backend directory
npm run db:seed-ts    # Seeds with 100 skills across 10 categories + sample users
```

### 6. Frontend Setup
```bash
# New terminal
cd frontend
npm install
npm run dev
```
Frontend will be available at `http://localhost:5173`

### 🎉 Access the Application
Open `http://localhost:5173` in your browser!

## 📚 Available Scripts

### Backend Scripts
```bash
npm run dev          # TypeScript development with hot reload
npm run build        # Compile TypeScript to JavaScript
npm start           # Run compiled JavaScript (production)
npm run db:seed-ts  # Seed database with TypeScript script
npm run db:seed     # Legacy JavaScript seed script
```

### Frontend Scripts
```bash
npm run dev         # Development server with hot reload
npm run build       # Production build
npm run lint        # ESLint code checking
npm run preview     # Preview production build
```

### Docker Scripts
```bash
docker-compose up -d              # Start PostgreSQL database
docker-compose down               # Stop database
docker-compose down -v            # Stop database and remove volumes
docker-compose logs postgres      # View database logs
```

## 🏗️ Project Structure

```
skillswap/
├── backend/                    # TypeScript Express API
│   ├── src/
│   │   ├── entities/          # TypeORM database entities
│   │   ├── services/          # Business logic layer
│   │   ├── routes/           # API route handlers
│   │   ├── middleware/       # Express middleware
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── config/          # Database & app configuration
│   │   ├── utils/           # Utility functions
│   │   └── scripts/         # Database seeding scripts
│   ├── logs/               # Application logs
│   ├── dist/              # Compiled JavaScript (after build)
│   └── package.json
├── frontend/                  # React TypeScript SPA
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.jsx         # Main application component
│   │   └── main.jsx        # Application entry point
│   └── package.json
├── docker-compose.yml        # PostgreSQL database setup
└── README.md                # This file
```

## 🔒 Security Features

### Backend Security
- **Password Hashing**: bcrypt with 12 salt rounds
- **Rate Limiting**: 100 requests/15min general, 5 auth requests/15min
- **Input Validation**: Comprehensive validation with sanitization
- **Security Headers**: Helmet.js for XSS, CSRF protection
- **CORS**: Configured for frontend origin only
- **Error Handling**: No sensitive information exposure

### Data Protection
- **SQL Injection**: Prevented by TypeORM parameterized queries
- **XSS Protection**: Content Security Policy headers
- **CSRF Protection**: SameSite cookie attributes
- **Input Sanitization**: Automatic trimming and basic sanitization

## 🌱 Database Schema

### Core Entities
- **Users**: Authentication, profiles, time credits
- **Skills**: Global skill registry with categories
- **SkillCategories**: Organized skill groupings
- **UserSkills**: Many-to-many with offer/seek types
- **SkillExchangeRequests**: Connection requests between users
- **UserReviews**: Rating and feedback system

### Sample Data
- **10 Categories**: Technology, Creative Arts, Business, Wellness, Languages, Education, Crafts, Culinary, Sports, Home & Garden
- **100 Skills**: 10 skills per category with detailed descriptions
- **15 Sample Users**: Generated with realistic profiles and skills

## 🚦 API Endpoints

### Authentication
- `POST /api/users/login` - User login
- `POST /api/users` - User registration

### User Management
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

### Skills
- `GET /api/skills` - List all skills with categories
- `GET /api/skills/categories` - List skill categories
- `GET /api/skills/by-category/:categoryId` - Skills by category

### User Skills
- `GET /api/users/:id/skills` - Get user's skills
- `POST /api/users/:id/skills` - Add skill to user
- `GET /api/users/search/by-skill` - Search users by skill

### Exchange Requests
- `POST /api/users/:id/exchange-requests` - Create exchange request
- `GET /api/users/:id/exchange-requests` - Get user's requests
- `PUT /api/users/:id/exchange-requests/:requestId` - Update request status

## 🛠️ Development

### Environment Variables
```bash
# Backend (.env)
DATABASE_URL=postgresql://user:password@localhost:5432/skill_exchange
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=info
```

### Database Connection
- **Host**: localhost:5432
- **Database**: skill_exchange
- **Username**: user
- **Password**: password

### Logging
- **Development**: Console + file logging
- **Production**: File logging only
- **Levels**: error, warn, info, debug
- **Files**: `logs/error.log`, `logs/combined.log`

## 🔄 Deployment

### Production Build
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

### Docker Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml up --build

# Or use individual Dockerfiles
docker build -t skillswap-backend ./backend
docker build -t skillswap-frontend ./frontend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📋 TODO & Future Enhancements

### Immediate Improvements
- [ ] JWT-based authentication tokens
- [ ] Real-time notifications for exchange requests
- [ ] Advanced search filters (location, availability)
- [ ] User profile photos/avatars

### Medium-term Features
- [ ] Direct messaging system
- [ ] Scheduling integration
- [ ] Mobile app (React Native)
- [ ] Time banking credit system
- [ ] Review and rating system

### Long-term Vision
- [ ] AI-powered skill matching
- [ ] Video call integration
- [ ] Gamification and achievements
- [ ] Community events and workshops
- [ ] Multi-language support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies and best practices
- Inspired by the sharing economy and community learning
- Designed for real-world skill exchange and community building

---

**Happy Skill Swapping! 🎓✨**
