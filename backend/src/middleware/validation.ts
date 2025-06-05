import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import logger from '../utils/logger';

export function validationMiddleware<T extends object>(
  type: new () => T,
  skipMissingProperties = false
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToClass(type, req.body);
      const errors = await validate(dto, { skipMissingProperties });

      if (errors.length > 0) {
        const errorMessages = errors.map(error => {
          return Object.values(error.constraints || {}).join(', ');
        }).join('; ');

        logger.warn('Validation failed', { 
          errors: errorMessages, 
          body: req.body,
          path: req.path 
        });

        return res.status(400).json({
          error: 'Validation failed',
          details: errorMessages,
        });
      }

      req.body = dto;
      next();
    } catch (error) {
      logger.error('Validation middleware error', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}