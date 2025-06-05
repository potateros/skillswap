import { IsNotEmpty, IsOptional, IsIn, IsInt, Min, Max, IsString } from 'class-validator';
import { SkillType, ProficiencyLevel } from '../entities/UserSkill';

export class CreateUserSkillDTO {
  @IsNotEmpty()
  @IsString()
  skillName: string;

  @IsIn(Object.values(SkillType))
  type: SkillType;

  @IsOptional()
  @IsIn(Object.values(ProficiencyLevel))
  proficiencyLevel?: ProficiencyLevel;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  yearsExperience?: number;

  @IsOptional()
  @IsString()
  description?: string;
}