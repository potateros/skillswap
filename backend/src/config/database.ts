import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Skill } from '../entities/Skill';
import { SkillCategory } from '../entities/SkillCategory';
import { UserSkill } from '../entities/UserSkill';
import { SkillExchangeRequest } from '../entities/SkillExchangeRequest';
import { TimeTransaction } from '../entities/TimeTransaction';
import { Review } from '../entities/Review';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'user',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'skill_exchange',
  synchronize: true, // Automatically create database schema (dev only)
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Skill, SkillCategory, UserSkill, SkillExchangeRequest, TimeTransaction, Review],
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
