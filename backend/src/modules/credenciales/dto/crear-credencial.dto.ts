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
  estudianteId: number;

  @ApiProperty({ example: '2024' })
  @IsString()
  @MaxLength(10)
  gestion: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  gestionId?: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Max(6)
  semestre: number;

  @ApiProperty({ example: '2024-02-01' })
  @IsDateString()
  fechaEmision: string;

  @ApiProperty({ example: '2025-02-01' })
  @IsDateString()
  validoHasta: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(255)
  fotoUrl?: string;

  @ApiPropertyOptional({ enum: EstadoCredencial })
  @IsEnum(EstadoCredencial)
  @IsOptional()
  estado?: EstadoCredencial;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  emitidoPor?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  impreso?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notas?: string;
}
