# SkillSwap Frontend

## Overview
React application for the SkillSwap peer-to-peer skill exchange platform. Built with Vite, Tailwind CSS, and modern React patterns.

## Tech Stack
- **React 19** with hooks and functional components
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for utility-first styling
- **Fetch API** for backend communication

## Key Features
- User registration and login
- Skill portfolio management (offer/seek skills)
- Real-time skill search and filtering
- Connection requests between users
- Responsive design for all devices

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
- **Components**: Modular React components for each feature
- **State Management**: React hooks for local state
- **API Integration**: Centralized fetch calls with error handling
- **Styling**: Tailwind CSS with consistent design system
