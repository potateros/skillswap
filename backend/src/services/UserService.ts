import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from '../dto/UserDTO';
import { createAppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

export class UserService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async createUser(userData: CreateUserDTO): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: userData.email }
      });

      if (existingUser) {
        throw createAppError('Email already exists', 409);
      }

      const user = this.userRepository.create(userData);
      const savedUser = await this.userRepository.save(user);
      
      logger.info('User created successfully', { userId: savedUser.id, email: savedUser.email });
      return savedUser;
    } catch (error) {
      if ((error as any).statusCode) throw error;
      logger.error('Error creating user', error);
      throw createAppError('Failed to create user', 500);
    }
  }

  async loginUser(loginData: LoginUserDTO): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: loginData.email }
      });

      if (!user) {
        throw createAppError('Invalid email or password', 401);
      }

      const isValidPassword = await user.validatePassword(loginData.password);
      if (!isValidPassword) {
        throw createAppError('Invalid email or password', 401);
      }

      logger.info('User logged in successfully', { userId: user.id, email: user.email });
      return user;
    } catch (error) {
      if ((error as any).statusCode) throw error;
      logger.error('Error during login', error);
      throw createAppError('Login failed', 500);
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await this.userRepository.find({
        order: { created_at: 'DESC' }
      });
    } catch (error) {
      logger.error('Error fetching users', error);
      throw createAppError('Failed to fetch users', 500);
    }
  }

  async getAllUsersWithSkills(): Promise<any[]> {
    try {
      const users = await this.userRepository.find({
        relations: ['user_skills', 'user_skills.skill', 'user_skills.skill.category'],
        order: { created_at: 'DESC' }
      });

      // Transform to match frontend expectations
      return users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        location: user.location,
        time_credits: user.time_credits,
        created_at: user.created_at,
        skills_offer: user.user_skills
          ? user.user_skills
              .filter(us => us.type === 'offer')
              .map(us => ({
                skill_id: us.skill.id,
                skill_name: us.skill.name,
                skill_description: us.skill.description,
                type: us.type,
                proficiency_level: us.proficiency_level,
                years_experience: us.years_experience,
                description: us.description,
                category_name: us.skill.category?.name
              }))
          : [],
        skills_seek: user.user_skills
          ? user.user_skills
              .filter(us => us.type === 'seek')
              .map(us => ({
                skill_id: us.skill.id,
                skill_name: us.skill.name,
                skill_description: us.skill.description,
                type: us.type,
                proficiency_level: us.proficiency_level,
                years_experience: us.years_experience,
                description: us.description,
                category_name: us.skill.category?.name
              }))
          : []
      }));
    } catch (error) {
      logger.error('Error fetching users with skills', error);
      throw createAppError('Failed to fetch users with skills', 500);
    }
  }

  async getUserById(id: number): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { id }
      });

      if (!user) {
        throw createAppError('User not found', 404);
      }

      return user;
    } catch (error) {
      if ((error as any).statusCode) throw error;
      logger.error('Error fetching user', error);
      throw createAppError('Failed to fetch user', 500);
    }
  }

  async updateUser(id: number, updateData: UpdateUserDTO): Promise<User> {
    try {
      const user = await this.getUserById(id);
      
      Object.assign(user, updateData);
      const updatedUser = await this.userRepository.save(user);
      
      logger.info('User updated successfully', { userId: updatedUser.id });
      return updatedUser;
    } catch (error) {
      if ((error as any).statusCode) throw error;
      logger.error('Error updating user', error);
      throw createAppError('Failed to update user', 500);
    }
  }
}