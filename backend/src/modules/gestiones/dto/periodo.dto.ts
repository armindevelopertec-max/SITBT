import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GestionStatus } from '../../../entities/enums/gestion-status.enum';

export class CreatePeriodoDto {
  @ApiProperty({ example: 'I' })
  @IsString()
  @MaxLength(10)
  number: string;

  @ApiPropertyOptional({ example: 'Primer Semestre' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;

  @ApiProperty({ example: '2025-02-20' })
  @IsDateString()
  start_date: string;

  @ApiProperty({ example: '2025-07-10' })
  @IsDateString()
  end_date: string;

  @ApiPropertyOptional({ enum: GestionStatus, default: GestionStatus.PENDIENTE })
  @IsEnum(GestionStatus)
  @IsOptional()
  status?: GestionStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdatePeriodoDto {
  @ApiPropertyOptional({ example: 'I' })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  number?: string;

  @ApiPropertyOptional({ example: 'Primer Semestre' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ example: '2025-02-20' })
  @IsDateString()
  @IsOptional()
  start_date?: string;

  @ApiPropertyOptional({ example: '2025-07-10' })
  @IsDateString()
  @IsOptional()
  end_date?: string;

  @ApiPropertyOptional({ enum: GestionStatus })
  @IsEnum(GestionStatus)
  @IsOptional()
  status?: GestionStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
