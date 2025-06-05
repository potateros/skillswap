import { IsNotEmpty, IsOptional, IsIn, IsInt, Min, Max, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
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
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  @IsInt()
  @Min(0)
  @Max(50)
  yearsExperience?: number;

  @IsOptional()
  @IsString()
  description?: string;
}