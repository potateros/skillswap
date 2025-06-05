import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Skill } from '../entities/Skill';
import { SkillCategory } from '../entities/SkillCategory';
import { UserSkill } from '../entities/UserSkill';
import { CreateUserSkillDTO } from '../dto/UserSkillDTO';
import { createAppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

export class SkillService {
  private skillRepository: Repository<Skill>;
  private skillCategoryRepository: Repository<SkillCategory>;
  private userSkillRepository: Repository<UserSkill>;

  constructor() {
    this.skillRepository = AppDataSource.getRepository(Skill);
    this.skillCategoryRepository = AppDataSource.getRepository(SkillCategory);
    this.userSkillRepository = AppDataSource.getRepository(UserSkill);
  }

  async getAllSkills(): Promise<Skill[]> {
    try {
      return await this.skillRepository.find({
        relations: ['category'],
        order: { 
          category: { name: 'ASC' },
          name: 'ASC' 
        }
      });
    } catch (error) {
      logger.error('Error fetching skills', error);
      throw createAppError('Failed to fetch skills', 500);
    }
  }

  async getAllCategories(): Promise<SkillCategory[]> {
    try {
      return await this.skillCategoryRepository.find({
        order: { name: 'ASC' }
      });
    } catch (error) {
      logger.error('Error fetching categories', error);
      throw createAppError('Failed to fetch categories', 500);
    }
  }

  async getSkillsByCategory(categoryId: number): Promise<Skill[]> {
    try {
      return await this.skillRepository.find({
        where: { category_id: categoryId },
        relations: ['category'],
        order: { name: 'ASC' }
      });
    } catch (error) {
      logger.error('Error fetching skills by category', error);
      throw createAppError('Failed to fetch skills by category', 500);
    }
  }

  async getUserSkills(userId: number): Promise<UserSkill[]> {
    try {
      return await this.userSkillRepository.find({
        where: { user_id: userId },
        relations: ['skill', 'skill.category'],
        order: { skill: { name: 'ASC' }, type: 'ASC' }
      });
    } catch (error) {
      logger.error('Error fetching user skills', error);
      throw createAppError('Failed to fetch user skills', 500);
    }
  }

  async addUserSkill(userId: number, skillData: CreateUserSkillDTO): Promise<UserSkill> {
    try {
      // Find or create skill
      let skill = await this.skillRepository.findOne({
        where: { name: skillData.skillName }
      });

      if (!skill) {
        skill = this.skillRepository.create({
          name: skillData.skillName,
          description: `${skillData.skillName} skill`
        });
        skill = await this.skillRepository.save(skill);
      }

      // Check if user already has this skill with this type
      const existingUserSkill = await this.userSkillRepository.findOne({
        where: {
          user_id: userId,
          skill_id: skill.id,
          type: skillData.type
        }
      });

      if (existingUserSkill) {
        throw createAppError('User already has this skill listed for this type', 409);
      }

      const userSkill = this.userSkillRepository.create({
        user_id: userId,
        skill_id: skill.id,
        type: skillData.type,
        proficiency_level: skillData.proficiencyLevel,
        years_experience: skillData.yearsExperience,
        description: skillData.description
      });

      const savedUserSkill = await this.userSkillRepository.save(userSkill);
      
      logger.info('User skill added successfully', { 
        userId, 
        skillId: skill.id, 
        type: skillData.type 
      });
      
      return savedUserSkill;
    } catch (error) {
      if (error.statusCode) throw error;
      logger.error('Error adding user skill', error);
      throw createAppError('Failed to add skill to user', 500);
    }
  }

  async searchUsersBySkill(skillName: string, type?: string): Promise<any[]> {
    try {
      const queryBuilder = this.userSkillRepository
        .createQueryBuilder('us')
        .leftJoinAndSelect('us.user', 'u')
        .leftJoinAndSelect('us.skill', 's')
        .leftJoinAndSelect('s.category', 'sc')
        .where('s.name ILIKE :skillName', { skillName: `%${skillName}%` });

      if (type && (type === 'offer' || type === 'seek')) {
        queryBuilder.andWhere('us.type = :type', { type });
      }

      queryBuilder.orderBy('u.name', 'ASC').addOrderBy('s.name', 'ASC');

      const results = await queryBuilder.getMany();

      // Transform results to match frontend expectations
      return results.map(userSkill => ({
        user_id: userSkill.user.id,
        user_name: userSkill.user.name,
        email: userSkill.user.email,
        user_bio: userSkill.user.bio,
        location: userSkill.user.location,
        time_credits: userSkill.user.time_credits,
        skill_id: userSkill.skill.id,
        skill_name: userSkill.skill.name,
        skill_type: userSkill.type,
        proficiency_level: userSkill.proficiency_level,
        years_experience: userSkill.years_experience,
        skill_description: userSkill.description,
        category_name: userSkill.skill.category?.name
      }));
    } catch (error) {
      logger.error('Error searching users by skill', error);
      throw createAppError('Failed to search users by skill', 500);
    }
  }
}