import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { IsEmail, IsNotEmpty, IsOptional, Length } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { UserSkill } from './UserSkill';
import { SkillExchangeRequest } from './SkillExchangeRequest';
import { TimeTransaction } from './TimeTransaction';
import { Review } from './Review';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Column()
  @IsNotEmpty()
  @Length(6, 100)
  password: string;

  @Column({ nullable: true })
  @IsOptional()
  @Length(1, 255)
  name: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  bio: string;

  @Column({ nullable: true })
  @IsOptional()
  location: string;

  @Column({ nullable: true })
  @IsOptional()
  avatar_url: string;

  @Column({ default: 10 })
  time_credits: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => UserSkill, userSkill => userSkill.user)
  user_skills: UserSkill[];

  @OneToMany(() => SkillExchangeRequest, request => request.requester)
  sent_requests: SkillExchangeRequest[];

  @OneToMany(() => SkillExchangeRequest, request => request.provider)
  received_requests: SkillExchangeRequest[];

  @OneToMany(() => TimeTransaction, transaction => transaction.user)
  timeTransactions: TimeTransaction[];

  @OneToMany(() => Review, review => review.reviewer)
  reviewsGiven: Review[];

  @OneToMany(() => Review, review => review.reviewee)
  reviewsReceived: Review[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const saltRounds = 12;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  // Remove password from JSON responses
  toJSON() {
    const { password, ...result } = this;
    return result;
  }
}