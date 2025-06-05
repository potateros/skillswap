import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { IsNotEmpty, Length } from 'class-validator';
import { SkillCategory } from './SkillCategory';
import { UserSkill } from './UserSkill';
import { SkillExchangeRequest } from './SkillExchangeRequest';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsNotEmpty()
  @Length(1, 255)
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  category_id: number;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => SkillCategory, category => category.skills)
  @JoinColumn({ name: 'category_id' })
  category: SkillCategory;

  @OneToMany(() => UserSkill, userSkill => userSkill.skill)
  user_skills: UserSkill[];

  @OneToMany(() => SkillExchangeRequest, request => request.skill_offered)
  exchange_requests_offered: SkillExchangeRequest[];

  @OneToMany(() => SkillExchangeRequest, request => request.skill_requested)
  exchange_requests_requested: SkillExchangeRequest[];
}