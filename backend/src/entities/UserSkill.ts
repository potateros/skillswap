import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { IsNotEmpty, IsIn, IsOptional, IsInt, Min, Max } from 'class-validator';
import { User } from './User';
import { Skill } from './Skill';

export enum SkillType {
  OFFER = 'offer',
  SEEK = 'seek',
}

export enum ProficiencyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

@Entity('user_skills')
@Unique(['user_id', 'skill_id', 'type'])
export class UserSkill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  user_id: number;

  @Column()
  @IsNotEmpty()
  skill_id: number;

  @Column({
    type: 'enum',
    enum: SkillType,
  })
  @IsIn(Object.values(SkillType))
  type: SkillType;

  @Column({
    type: 'enum',
    enum: ProficiencyLevel,
    nullable: true,
  })
  @IsOptional()
  @IsIn(Object.values(ProficiencyLevel))
  proficiency_level: ProficiencyLevel;

  @Column({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  years_experience: number;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  description: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User, user => user.user_skills, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Skill, skill => skill.user_skills, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'skill_id' })
  skill: Skill;
}