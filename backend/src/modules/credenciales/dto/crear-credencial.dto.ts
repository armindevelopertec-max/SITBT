import {
  IsInt,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoCredencial } from '../../../entities/credencial.entity';

export class CrearCredencialDto {
  @ApiProperty()
  @IsInt()
  student_id: number;

  @ApiProperty({ example: '2024' })
  @IsString()
  @MaxLength(10)
  gestion: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  gestion_id?: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Max(6)
  semester: number;

  @ApiProperty({ example: '2024-02-01' })
  @IsDateString()
  issued_date: string;

  @ApiProperty({ example: '2025-02-01' })
  @IsDateString()
  valid_until: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(255)
  photo_url?: string;

  @ApiPropertyOptional({ enum: EstadoCredencial })
  @IsEnum(EstadoCredencial)
  @IsOptional()
  status?: EstadoCredencial;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  issued_by?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  printed?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
