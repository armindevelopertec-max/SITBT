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
  equivalenciaId?: number;

  @ApiProperty()
  @IsInt()
  materiaDestinoId: number;

  @ApiProperty({ enum: TipoConvalidacion })
  @IsEnum(TipoConvalidacion)
  tipo: TipoConvalidacion;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(50)
  numeroResolucion?: string;

  @ApiPropertyOptional({ example: '2024-06-15' })
  @IsDateString()
  @IsOptional()
  fechaResolucion?: string;

  @ApiPropertyOptional({ enum: EstadoConvalidacion })
  @IsEnum(EstadoConvalidacion)
  @IsOptional()
  estado?: EstadoConvalidacion;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  aprobadoPor?: number;
}