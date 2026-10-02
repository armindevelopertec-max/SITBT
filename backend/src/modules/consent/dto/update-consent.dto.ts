import { IsEnum, IsOptional, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ConsentType } from '../../../entities/consent-record.entity';

export class UpdateConsentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(ConsentType)
  derechoEjercido?: ConsentType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  registrado_por?: number;
}
