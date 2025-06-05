# SkillSwap Frontend

## Overview
Modern React application for the SkillSwap peer-to-peer skill exchange platform. Features persistent authentication, comprehensive skill management, real-time updates, and a complete skill exchange ecosystem.

## Tech Stack
- **React 19** with hooks and functional components
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for utility-first styling and responsive design
- **Fetch API** with credentials for authenticated requests
- **Cookie-based Authentication** for persistent sessions

## Key Features

### 🔐 Authentication & Sessions
- **Persistent Login**: Automatic login restoration using HTTP-only cookies
- **Session Management**: Secure cookie-based authentication that survives page refreshes
- **User Registration/Login**: Seamless onboarding with automatic session creation
- **Logout**: Complete session cleanup with cookie removal

### 🎯 Skill Management
- **Interactive Skill Portfolio**: Add/manage offered and sought skills with proficiency levels
- **Real-time Skill Search**: Instant search with filtering by skill type (offer/seek)
- **Featured Skills**: Quick access to popular skills for discovery
- **Skill Categories**: Browse 100+ skills across 10 organized categories

### 💬 Exchange System
- **Exchange Requests**: Send detailed skill exchange requests with custom messages
- **Request Management**: View, accept, and decline incoming requests
- **Status Tracking**: Real-time status updates (pending/accepted/declined)
- **Request History**: Complete view of sent and received requests

### 🤖 Smart Features
- **Smart Matching**: AI-powered skill matching based on user profiles
- **Optimized Loading**: Single API calls to prevent rate limiting
- **Real-time Notifications**: In-app notifications for actions and updates
- **Dynamic UI Updates**: Content updates without page refresh

### 💰 Time Banking Interface
- **Credit Dashboard**: View and manage time credit balance
- **Transaction History**: Track credits earned and spent
- **Exchange Integration**: Time credits integrated with skill exchanges

### ⭐ Review System
- **Review Management**: Give and receive reviews for skill exchanges
- **Reputation Tracking**: Build and view user reputation scores
- **Review Interface**: Easy-to-use rating and feedback system

### 📱 User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Tabbed Navigation**: Organized interface (Discover, Smart Match, Profile, Time Bank, Reviews, Requests)
- **Loading States**: Smooth loading indicators and error handling
- **Accessibility**: Keyboard navigation and screen reader support

## Development Setup
```bash
npm install
npm run dev
# Opens at http://localhost:5173
```

## Build & Deploy
```bash
npm run build      # Production build
npm run preview    # Preview build locally
```

## Available Scripts
- `npm run dev` - Development server with hot reload
- `npm run build` - Production build
- `npm run lint` - Code quality check

## Architecture

### Component Structure
- **App.jsx**: Main application with session management and routing
- **UserRegistration/UserLogin**: Authentication components with form validation
- **SkillsManager**: Interactive skill portfolio management
- **SmartMatching**: AI-powered skill matching interface
- **TimeBankingDashboard**: Time credit management and transaction history
- **ReviewsManager**: Review system for skill exchanges
- **UserCard**: Reusable user profile cards with skill display
- **SearchFilters**: Advanced search and filtering interface

### State Management
- **React Hooks**: useState and useEffect for component state
- **Session Persistence**: Automatic login restoration on app load
- **Real-time Updates**: State synchronization across components
- **Optimistic Updates**: Immediate UI updates with error fallback

### API Integration
- **Authenticated Requests**: All API calls include credentials for session management
- **Error Handling**: Comprehensive error handling with user notifications
- **Rate Limit Optimization**: Single bulk API calls to prevent 429 errors
- **Response Processing**: Data transformation for optimal frontend consumption

### UI/UX Design
- **Tailwind CSS**: Utility-first styling with consistent design tokens
- **Responsive Grid**: Mobile-first design with adaptive layouts
- **Loading States**: Skeleton loading and progress indicators
- **Notification System**: Toast notifications for user feedback
- **Accessibility**: ARIA labels and keyboard navigation support

## Key Components

### Authentication Flow
```javascript
// Automatic session restoration
useEffect(() => {
  checkCurrentUser(); // Checks for existing session cookie
  fetchUsersWithSkills(); // Loads data regardless of auth state
}, []);
```

### Optimized Data Fetching
```javascript
// Single API call instead of N+1 queries
const fetchUsersWithSkills = async () => {
  const response = await fetch('/api/users/with-skills');
  // Prevents rate limiting issues
};
```

### Session Management
```javascript
// Persistent authentication
const handleLogin = async (loginData) => {
  // HTTP-only cookie set by backend
  // Automatic session restoration on refresh
};
```
