import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { IsNotEmpty, IsOptional, IsIn, IsInt, Min } from 'class-validator';
import { User } from './User';
import { Skill } from './Skill';
import { Review } from './Review';

export enum RequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  COMPLETED = 'completed',
}

@Entity('skill_exchange_requests')
export class SkillExchangeRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  requester_id: number;

  @Column()
  @IsNotEmpty()
  provider_id: number;

  @Column({ nullable: true })
  @IsOptional()
  skill_offered_id: number;

  @Column()
  @IsNotEmpty()
  skill_requested_id: number;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  message: string;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  @IsIn(Object.values(RequestStatus))
  status: RequestStatus;

  @Column({ default: 1 })
  @IsInt()
  @Min(1)
  credits_offered: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, user => user.sent_requests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requester_id' })
  requester: User;

  @ManyToOne(() => User, user => user.received_requests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: User;

  @ManyToOne(() => Skill, skill => skill.exchange_requests_offered)
  @JoinColumn({ name: 'skill_offered_id' })
  skill_offered: Skill;

  @ManyToOne(() => Skill, skill => skill.exchange_requests_requested, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'skill_requested_id' })
  skill_requested: Skill;

  // Note: Reviews are now independent of exchange requests
  // @OneToMany(() => Review, review => review.exchange_request)
  // reviews: Review[];
}