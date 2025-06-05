import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Check,
} from 'typeorm';
import { IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';
import { User } from './User';
import { SkillExchangeRequest } from './SkillExchangeRequest';

@Entity('user_reviews')
@Unique(['reviewer_id', 'reviewee_id', 'exchange_request_id'])
@Check(`"rating" >= 1 AND "rating" <= 5`)
export class UserReview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  reviewer_id: number;

  @Column()
  @IsNotEmpty()
  reviewee_id: number;

  @Column({ nullable: true })
  @IsOptional()
  exchange_request_id: number;

  @Column()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  comment: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User, user => user.reviews_given, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User;

  @ManyToOne(() => User, user => user.reviews_received, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reviewee_id' })
  reviewee: User;

  @ManyToOne(() => SkillExchangeRequest, request => request.reviews)
  @JoinColumn({ name: 'exchange_request_id' })
  exchange_request: SkillExchangeRequest;
}