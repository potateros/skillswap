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
      if (error.statusCode) throw error;
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
      if (error.statusCode) throw error;
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
      if (error.statusCode) throw error;
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
      if (error.statusCode) throw error;
      logger.error('Error updating user', error);
      throw createAppError('Failed to update user', 500);
    }
  }
}