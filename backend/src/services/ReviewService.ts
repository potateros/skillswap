import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Review, ReviewType } from '../entities/Review';
import logger from '../utils/logger';

export interface CreateReviewRequest {
  reviewerId: number;
  revieweeId: number;
  type: ReviewType;
  rating: number;
  comment?: string;
  skillName?: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
  asTeacher: {
    averageRating: number;
    totalReviews: number;
  };
  asStudent: {
    averageRating: number;
    totalReviews: number;
  };
}

export class ReviewService {
  private reviewRepository: Repository<Review>;
  private userRepository: Repository<User>;

  constructor() {
    this.reviewRepository = AppDataSource.getRepository(Review);
    this.userRepository = AppDataSource.getRepository(User);
  }

  async createReview(request: CreateReviewRequest): Promise<Review> {
    try {
      // Validate users exist
      const [reviewer, reviewee] = await Promise.all([
        this.userRepository.findOne({ where: { id: request.reviewerId } }),
        this.userRepository.findOne({ where: { id: request.revieweeId } })
      ]);

      if (!reviewer || !reviewee) {
        throw new Error('Reviewer or reviewee not found');
      }

      if (reviewer.id === reviewee.id) {
        throw new Error('Cannot review yourself');
      }

      // Validate rating
      if (request.rating < 1 || request.rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      // Check if review already exists
      const existingReview = await this.reviewRepository.findOne({
        where: {
          reviewer: { id: request.reviewerId },
          reviewee: { id: request.revieweeId },
          type: request.type,
          ...(request.skillName && { skillName: request.skillName })
        }
      });

      if (existingReview) {
        throw new Error('Review already exists for this skill exchange');
      }

      // Create review
      const review = new Review();
      review.reviewer = reviewer;
      review.reviewee = reviewee;
      review.type = request.type;
      review.rating = request.rating;
      review.comment = request.comment || '';
      review.skillName = request.skillName || '';

      const savedReview = await this.reviewRepository.save(review);

      logger.info(`Review created: ${reviewer.id} -> ${reviewee.id}, rating: ${request.rating}`);
      return savedReview;

    } catch (error) {
      logger.error('Failed to create review:', error);
      throw error;
    }
  }

  async getUserReviews(userId: number, asReviewee: boolean = true): Promise<Review[]> {
    const whereCondition = asReviewee 
      ? { reviewee: { id: userId } }
      : { reviewer: { id: userId } };

    return this.reviewRepository.find({
      where: { ...whereCondition, isVisible: true },
      relations: ['reviewer', 'reviewee'],
      order: { createdAt: 'DESC' }
    });
  }

  async getReviewStats(userId: number): Promise<ReviewStats> {
    const reviews = await this.reviewRepository.find({
      where: { reviewee: { id: userId }, isVisible: true }
    });

    const teacherReviews = reviews.filter(r => r.type === ReviewType.TEACHER_REVIEW);
    const studentReviews = reviews.filter(r => r.type === ReviewType.STUDENT_REVIEW);

    const calculateStats = (reviewList: Review[]) => {
      if (reviewList.length === 0) return { averageRating: 0, totalReviews: 0 };
      
      const totalRating = reviewList.reduce((sum, review) => sum + review.rating, 0);
      return {
        averageRating: Number((totalRating / reviewList.length).toFixed(1)),
        totalReviews: reviewList.length
      };
    };

    const overallStats = calculateStats(reviews);
    const teacherStats = calculateStats(teacherReviews);
    const studentStats = calculateStats(studentReviews);

    // Rating distribution
    const ratingDistribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      ratingDistribution[review.rating]++;
    });

    return {
      averageRating: overallStats.averageRating,
      totalReviews: overallStats.totalReviews,
      ratingDistribution,
      asTeacher: teacherStats,
      asStudent: studentStats
    };
  }

  async getSkillReviews(skillName: string, type?: ReviewType): Promise<Review[]> {
    const whereCondition: any = {
      skillName: skillName,
      isVisible: true
    };

    if (type) {
      whereCondition.type = type;
    }

    return this.reviewRepository.find({
      where: whereCondition,
      relations: ['reviewer', 'reviewee'],
      order: { createdAt: 'DESC' }
    });
  }

  async hideReview(reviewId: number, userId: number): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['reviewee']
    });

    if (!review) {
      throw new Error('Review not found');
    }

    // Only the reviewee can hide their own reviews
    if (review.reviewee.id !== userId) {
      throw new Error('You can only hide reviews about yourself');
    }

    review.isVisible = false;
    await this.reviewRepository.save(review);

    logger.info(`Review ${reviewId} hidden by user ${userId}`);
  }
}