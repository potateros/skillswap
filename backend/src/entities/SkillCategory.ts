import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { IsNotEmpty, Length } from 'class-validator';
import { Skill } from './Skill';

@Entity('skill_categories')
export class SkillCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsNotEmpty()
  @Length(1, 255)
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @OneToMany(() => Skill, skill => skill.category)
  skills: Skill[];
}