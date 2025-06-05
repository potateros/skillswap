import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { initializeDatabase, AppDataSource } from './config/database';
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
const startTime = new Date();

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

// Comprehensive health check endpoint
app.get('/api/health', async (req, res) => {
  const healthCheck: any = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    startTime: startTime.toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0',
    services: {},
    system: {},
    checks: {}
  };

  let overallStatus = 'healthy';
  let httpStatus = 200;

  try {
    // Database connectivity check
    if (AppDataSource.isInitialized) {
      try {
        await AppDataSource.query('SELECT 1');
        healthCheck.services.database = {
          status: 'healthy',
          connection: 'active',
          driver: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          database: process.env.DB_NAME || 'skill_exchange'
        };
      } catch (dbError) {
        healthCheck.services.database = {
          status: 'unhealthy',
          error: 'Query failed',
          connection: 'inactive'
        };
        overallStatus = 'unhealthy';
        httpStatus = 503;
      }
    } else {
      healthCheck.services.database = {
        status: 'unhealthy',
        error: 'Database not initialized',
        connection: 'inactive'
      };
      overallStatus = 'unhealthy';
      httpStatus = 503;
    }

    // Memory usage check
    const memUsage = process.memoryUsage();
    healthCheck.system.memory = {
      used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024), // MB
      rss: Math.round(memUsage.rss / 1024 / 1024) // MB
    };

    // CPU and system info
    healthCheck.system.process = {
      pid: process.pid,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    };

    // Critical service checks
    healthCheck.checks.criticalServices = {
      express: 'healthy',
      typeorm: AppDataSource.isInitialized ? 'healthy' : 'unhealthy',
      authentication: 'healthy' // Auth middleware is always loaded
    };

    // Configuration checks
    healthCheck.checks.configuration = {
      port: port,
      corsOrigin: process.env.FRONTEND_URL || 'http://localhost:5173',
      sessionSecret: process.env.SESSION_SECRET ? 'configured' : 'default',
      rateLimit: 'configured'
    };

    // Set overall status
    healthCheck.status = overallStatus;

    // Log health check if unhealthy
    if (overallStatus === 'unhealthy') {
      logger.warn('Health check failed', { healthCheck });
    }

    res.status(httpStatus).json(healthCheck);
  } catch (error) {
    logger.error('Health check endpoint error', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Simple readiness probe (for Kubernetes/Docker)
app.get('/api/ready', async (req, res) => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.query('SELECT 1');
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        reason: 'Database not initialized'
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      reason: 'Database connection failed'
    });
  }
});

// Simple liveness probe (for Kubernetes/Docker)
app.get('/api/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
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
