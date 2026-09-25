import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GestionStatus } from '../../../entities/enums/gestion-status.enum';
import { PeriodType } from '../../../entities/enums/period-type.enum';

export class CreateGestionDto {
  @ApiProperty({ example: '2025' })
  @IsString()
  @MaxLength(10)
  year: string;

  @ApiPropertyOptional({ enum: PeriodType, default: PeriodType.SEMESTRAL })
  @IsEnum(PeriodType)
  @IsOptional()
  period_type?: PeriodType;

  @ApiPropertyOptional({ enum: GestionStatus, default: GestionStatus.PENDIENTE })
  @IsEnum(GestionStatus)
  @IsOptional()
  status?: GestionStatus;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  is_current?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
