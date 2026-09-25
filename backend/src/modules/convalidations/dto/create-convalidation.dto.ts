import {
  IsInt,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConvalidationType, ConvalidationStatus } from '../../../entities/convalidacion-estudiante.entity';

export class CreateConvalidationDto {
  @ApiProperty()
  @IsInt()
  student_id: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  equivalence_id?: number;

  @ApiProperty()
  @IsInt()
  target_subject_id: number;

  @ApiProperty({ enum: ConvalidationType })
  @IsEnum(ConvalidationType)
  type: ConvalidationType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(50)
  resolution_number?: string;

  @ApiPropertyOptional({ example: '2024-06-15' })
  @IsDateString()
  @IsOptional()
  resolution_date?: string;

  @ApiPropertyOptional({ enum: ConvalidationStatus })
  @IsEnum(ConvalidationStatus)
  @IsOptional()
  status?: ConvalidationStatus;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  approved_by?: number;
}