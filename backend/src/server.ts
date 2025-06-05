import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { rateLimitConfig, helmetConfig, sanitizeInput } from './middleware/security';
import { authMiddleware } from './middleware/auth';
import logger from './utils/logger';

// Import routes
import userRoutes from './routes/users';
import skillRoutes from './routes/skills';

// Import JavaScript routes (temporary until TypeScript conversion)
const timeBankingRoutes = require('../routes/timebanking');
const reviewRoutes = require('../routes/reviews');
const matchingRoutes = require('../routes/matching');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmetConfig);
app.use(rateLimitConfig);
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parsing middleware
app.use(cookieParser());

// Input sanitization
app.use(sanitizeInput);

// Authentication middleware
app.use(authMiddleware);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'SkillSwap API is running!',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/timebanking', timeBankingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/matching', matchingRoutes);

// Test DB connection endpoint
app.get('/api/health', async (req, res) => {
  try {
    // TODO: Add actual health check logic
    res.json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(500).json({ 
      status: 'unhealthy',
      error: 'Database connection failed'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Initialize database connection
    await initializeDatabase();
    logger.info('Database initialized successfully');

    // Start HTTP server
    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { reason, promise });
  process.exit(1);
});

startServer();