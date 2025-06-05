import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Skill } from '../entities/Skill';
import { SkillCategory } from '../entities/SkillCategory';
import { UserSkill } from '../entities/UserSkill';
import { SkillExchangeRequest } from '../entities/SkillExchangeRequest';
import { UserReview } from '../entities/UserReview';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: process.env.NODE_ENV !== 'production', // Auto-sync in development
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Skill, SkillCategory, UserSkill, SkillExchangeRequest, UserReview],
  migrations: [],
  subscribers: [],
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established successfully');
  } catch (error) {
    console.error('Error during database initialization:', error);
    throw error;
  }
};