import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoGestion } from '../../../entities/enums/gestion-status.enum';

export class CreatePeriodoDto {
  @ApiProperty({ example: 'I' })
  @IsString()
  @MaxLength(10)
  numero: string;

  @ApiPropertyOptional({ example: 'Primer Semestre' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  nombre?: string;

  @ApiProperty({ example: '2025-02-20' })
  @IsDateString()
  fechaInicio: string;

  @ApiProperty({ example: '2025-07-10' })
  @IsDateString()
  fechaFin: string;

  @ApiPropertyOptional({ enum: EstadoGestion, default: EstadoGestion.PENDIENTE })
  @IsEnum(EstadoGestion)
  @IsOptional()
  estado?: EstadoGestion;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notas?: string;
}

export class UpdatePeriodoDto {
  @ApiPropertyOptional({ example: 'I' })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  numero?: string;

  @ApiPropertyOptional({ example: 'Primer Semestre' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  nombre?: string;

  @ApiPropertyOptional({ example: '2025-02-20' })
  @IsDateString()
  @IsOptional()
  fechaInicio?: string;

  @ApiPropertyOptional({ example: '2025-07-10' })
  @IsDateString()
  @IsOptional()
  fechaFin?: string;

  @ApiPropertyOptional({ enum: EstadoGestion })
  @IsEnum(EstadoGestion)
  @IsOptional()
  estado?: EstadoGestion;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notas?: string;
}
