import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { UserSkill } from '../entities/UserSkill';
import { Review, ReviewType } from '../entities/Review';
import logger from '../utils/logger';

export interface MatchResult {
  user: User;
  matchScore: number;
  matchReasons: string[];
  commonSkills: string[];
  complementarySkills: string[];
  rating?: number;
  reviewCount?: number;
}

export interface MatchingCriteria {
  userId: number;
  skillName?: string;
  skillType?: 'offer' | 'seek';
  maxDistance?: number;
  minRating?: number;
  limit?: number;
}

export class MatchingService {
  private userRepository: Repository<User>;
  private userSkillRepository: Repository<UserSkill>;
  private reviewRepository: Repository<Review>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.userSkillRepository = AppDataSource.getRepository(UserSkill);
    this.reviewRepository = AppDataSource.getRepository(Review);
  }

  async findMatches(criteria: MatchingCriteria): Promise<MatchResult[]> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: criteria.userId },
        relations: ['user_skills', 'user_skills.skill']
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Get all potential matches (excluding the user themselves)
      let potentialMatches = await this.userRepository.find({
        where: criteria.skillName ? undefined : { id: user.id }, // Will be filtered later
        relations: ['user_skills', 'user_skills.skill']
      });

      // Remove the current user from potential matches
      potentialMatches = potentialMatches.filter(match => match.id !== user.id);

      // Apply skill-based filtering if specified
      if (criteria.skillName) {
        potentialMatches = await this.filterBySkill(criteria.skillName, criteria.skillType);
        potentialMatches = potentialMatches.filter(match => match.id !== user.id);
      }

      // Calculate match scores for each potential match
      const matchResults: MatchResult[] = [];

      for (const potentialMatch of potentialMatches) {
        const matchResult = await this.calculateMatchScore(user, potentialMatch);
        
        // Apply rating filter if specified
        if (criteria.minRating && matchResult.rating && matchResult.rating < criteria.minRating) {
          continue;
        }

        matchResults.push(matchResult);
      }

      // Sort by match score (descending)
      matchResults.sort((a, b) => b.matchScore - a.matchScore);

      // Apply limit
      const limit = criteria.limit || 10;
      return matchResults.slice(0, limit);

    } catch (error) {
      logger.error('Failed to find matches:', error);
      throw error;
    }
  }

  private async filterBySkill(skillName: string, skillType?: 'offer' | 'seek'): Promise<User[]> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.user_skills', 'userSkill')
      .innerJoin('userSkill.skill', 'skill')
      .where('skill.name ILIKE :skillName', { skillName: `%${skillName}%` });

    if (skillType) {
      queryBuilder.andWhere('userSkill.type = :skillType', { skillType });
    }

    return queryBuilder
      .select(['user.id', 'user.name', 'user.email', 'user.bio', 'user.location', 'user.time_credits'])
      .getMany();
  }

  private async calculateMatchScore(user: User, potentialMatch: User): Promise<MatchResult> {
    const userSkills = user.user_skills || [];
    const matchSkills = potentialMatch.user_skills || [];

    let matchScore = 0;
    const matchReasons: string[] = [];
    const commonSkills: string[] = [];
    const complementarySkills: string[] = [];

    // 1. Complementary Skills Score (40% weight)
    const userOfferedSkills = userSkills
      .filter(us => us.type === 'offer')
      .map(us => us.skill.name.toLowerCase());
    
    const userSoughtSkills = userSkills
      .filter(us => us.type === 'seek')
      .map(us => us.skill.name.toLowerCase());

    const matchOfferedSkills = matchSkills
      .filter(us => us.type === 'offer')
      .map(us => us.skill.name.toLowerCase());

    const matchSoughtSkills = matchSkills
      .filter(us => us.type === 'seek')
      .map(us => us.skill.name.toLowerCase());

    // Check if user seeks what match offers
    const userWantsMatchOffers = userSoughtSkills.filter(skill => 
      matchOfferedSkills.includes(skill)
    );

    // Check if match seeks what user offers
    const matchWantsUserOffers = matchSoughtSkills.filter(skill => 
      userOfferedSkills.includes(skill)
    );

    const complementaryScore = (userWantsMatchOffers.length + matchWantsUserOffers.length) * 20;
    matchScore += complementaryScore;

    if (userWantsMatchOffers.length > 0) {
      matchReasons.push(`They can teach you: ${userWantsMatchOffers.join(', ')}`);
      complementarySkills.push(...userWantsMatchOffers);
    }

    if (matchWantsUserOffers.length > 0) {
      matchReasons.push(`You can teach them: ${matchWantsUserOffers.join(', ')}`);
      complementarySkills.push(...matchWantsUserOffers);
    }

    // 2. Common Interests Score (20% weight)
    const commonOfferedSkills = userOfferedSkills.filter(skill => 
      matchOfferedSkills.includes(skill)
    );

    const commonSoughtSkills = userSoughtSkills.filter(skill => 
      matchSoughtSkills.includes(skill)
    );

    const commonScore = (commonOfferedSkills.length + commonSoughtSkills.length) * 10;
    matchScore += commonScore;

    if (commonOfferedSkills.length > 0) {
      matchReasons.push(`You both teach: ${commonOfferedSkills.join(', ')}`);
      commonSkills.push(...commonOfferedSkills);
    }

    if (commonSoughtSkills.length > 0) {
      matchReasons.push(`You both want to learn: ${commonSoughtSkills.join(', ')}`);
      commonSkills.push(...commonSoughtSkills);
    }

    // 3. Skill Level Compatibility (15% weight)
    let skillLevelScore = 0;
    for (const userSkill of userSkills) {
      const matchingSkill = matchSkills.find(ms => 
        ms.skill.name.toLowerCase() === userSkill.skill.name.toLowerCase()
      );
      
      if (matchingSkill) {
        // Prefer users with different skill types (teach vs learn)
        if (userSkill.type !== matchingSkill.type) {
          skillLevelScore += 15;
        }
        // Bonus for appropriate skill level differences
        const levelMap = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };
        const userLevel = levelMap[userSkill.proficiency_level as keyof typeof levelMap] || 2;
        const matchLevel = levelMap[matchingSkill.proficiency_level as keyof typeof levelMap] || 2;
        const levelDiff = Math.abs(userLevel - matchLevel);
        if (levelDiff === 1 || levelDiff === 2) {
          skillLevelScore += 5;
        }
      }
    }
    matchScore += skillLevelScore;

    // 4. User Rating and Activity Score (15% weight)
    const { rating, reviewCount } = await this.getUserRatingInfo(potentialMatch.id);
    
    if (rating > 0) {
      const ratingScore = (rating / 5) * 15; // Scale 0-5 rating to 0-15 points
      matchScore += ratingScore;
      
      if (rating >= 4.5) {
        matchReasons.push('Highly rated by community');
      } else if (rating >= 4.0) {
        matchReasons.push('Well rated by community');
      }
    }

    // 5. Profile Completeness Score (10% weight)
    let completenessScore = 0;
    if (potentialMatch.name) completenessScore += 2;
    if (potentialMatch.bio) completenessScore += 3;
    if (potentialMatch.location) completenessScore += 2;
    if (matchSkills.length > 0) completenessScore += 3;
    
    matchScore += completenessScore;

    if (completenessScore >= 8) {
      matchReasons.push('Complete profile');
    }

    // 6. Credit Balance (bonus for active users)
    if (potentialMatch.time_credits > 0) {
      matchScore += Math.min(potentialMatch.time_credits, 10); // Max 10 bonus points
      if (potentialMatch.time_credits >= 20) {
        matchReasons.push('Active community member');
      }
    }

    return {
      user: potentialMatch,
      matchScore: Math.round(matchScore),
      matchReasons,
      commonSkills: [...new Set(commonSkills)],
      complementarySkills: [...new Set(complementarySkills)],
      rating,
      reviewCount
    };
  }

  private async getUserRatingInfo(userId: number): Promise<{ rating: number; reviewCount: number }> {
    const reviews = await this.reviewRepository.find({
      where: { reviewee: { id: userId }, isVisible: true }
    });

    if (reviews.length === 0) {
      return { rating: 0, reviewCount: 0 };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    return {
      rating: Number(averageRating.toFixed(1)),
      reviewCount: reviews.length
    };
  }

  async getSkillRecommendations(userId: number): Promise<string[]> {
    try {
      // Get user's current skills
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['user_skills', 'user_skills.skill']
      });

      if (!user) {
        throw new Error('User not found');
      }

      const userSkillNames = user.user_skills.map(us => us.skill.name.toLowerCase());

      // Find popular skills that the user doesn't have
      const popularSkills = await this.userSkillRepository
        .createQueryBuilder('userSkill')
        .innerJoin('userSkill.skill', 'skill')
        .select('skill.name', 'skillName')
        .addSelect('COUNT(*)', 'skillCount')
        .where('userSkill.type = :type', { type: 'offer' })
        .groupBy('skill.name')
        .orderBy('"skillCount"', 'DESC')
        .limit(20)
        .getRawMany();

      // Filter out skills the user already has
      const recommendations = popularSkills
        .filter(skill => !userSkillNames.includes(skill.skillName.toLowerCase()))
        .slice(0, 5)
        .map(skill => skill.skillName);

      return recommendations;

    } catch (error) {
      logger.error('Failed to get skill recommendations:', error);
      return [];
    }
  }
}