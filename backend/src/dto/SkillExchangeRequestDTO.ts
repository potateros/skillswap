import { IsNotEmpty, IsOptional, IsIn, IsInt, Min, IsString } from 'class-validator';
import { RequestStatus } from '../entities/SkillExchangeRequest';

export class CreateSkillExchangeRequestDTO {
  @IsNotEmpty()
  @IsInt()
  providerId: number;

  @IsOptional()
  @IsInt()
  skillOfferedId?: number;

  @IsNotEmpty()
  @IsInt()
  skillRequestedId: number;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  creditsOffered?: number;
}

export class UpdateSkillExchangeRequestDTO {
  @IsIn(Object.values(RequestStatus))
  status: RequestStatus;
}