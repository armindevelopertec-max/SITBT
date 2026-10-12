import {
  IsInt,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoConvalidacion, EstadoConvalidacion } from '../../../entities/convalidacion-estudiante.entity';

export class CrearConvalidacionDto {
  @ApiProperty()
  @IsInt()
  estudianteId: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  equivalence_id?: number;

  @ApiProperty()
  @IsInt()
  target_subject_id: number;

  @ApiProperty({ enum: TipoConvalidacion })
  @IsEnum(TipoConvalidacion)
  tipo: TipoConvalidacion;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(50)
  resolution_number?: string;

  @ApiPropertyOptional({ example: '2024-06-15' })
  @IsDateString()
  @IsOptional()
  resolution_date?: string;

  @ApiPropertyOptional({ enum: EstadoConvalidacion })
  @IsEnum(EstadoConvalidacion)
  @IsOptional()
  estado?: EstadoConvalidacion;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  approved_by?: number;
}