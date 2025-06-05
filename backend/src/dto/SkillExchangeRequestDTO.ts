import { IsNotEmpty, IsOptional, IsIn, IsInt, Min, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { RequestStatus } from '../entities/SkillExchangeRequest';

export class CreateSkillExchangeRequestDTO {
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  providerId: number;

  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  @IsInt()
  skillOfferedId?: number;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  skillRequestedId: number;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  @IsInt()
  @Min(1)
  creditsOffered?: number;
}

export class UpdateSkillExchangeRequestDTO {
  @IsIn(Object.values(RequestStatus))
  status: RequestStatus;
}