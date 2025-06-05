import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import logger from '../utils/logger';
import crypto from 'crypto';

// Simple in-memory session store for POC
// In production, use Redis or database sessions
const sessions = new Map<string, { userId: number; expiresAt: Date }>();

// Clean up expired sessions every hour
setInterval(() => {
  const now = new Date();
  for (const [sessionId, session] of sessions.entries()) {
    if (session.expiresAt < now) {
      sessions.delete(sessionId);
    }
  }
}, 60 * 60 * 1000);

export function createSession(userId: number): string {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
  
  sessions.set(sessionId, { userId, expiresAt });
  return sessionId;
}

export function validateSession(sessionId: string): number | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  
  if (session.expiresAt < new Date()) {
    sessions.delete(sessionId);
    return null;
  }
  
  return session.userId;
}

export function destroySession(sessionId: string): void {
  sessions.delete(sessionId);
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = req.cookies.sessionId;
    
    if (!sessionId) {
      return next();
    }
    
    const userId = validateSession(sessionId);
    if (!userId) {
      res.clearCookie('sessionId');
      return next();
    }
    
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      destroySession(sessionId);
      res.clearCookie('sessionId');
      return next();
    }
    
    req.user = user;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    next();
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}