import {
  IsInt,
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  EstadoCalificacionRegular,
  EstadoCalificacion2T,
  EstadoCalificacionDefinitivo,
} from '../../../entities/calificacion.entity';

export class CrearCalificacionDto {
  @ApiProperty()
  @IsInt()
  inscripcionId: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  parcial1?: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  parcial2?: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  promedioFinal?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(30)
  observacion?: string;

  @ApiPropertyOptional({ enum: EstadoCalificacionRegular })
  @IsEnum(EstadoCalificacionRegular)
  @IsOptional()
  estadoRegular?: EstadoCalificacionRegular;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  aptoSegundaTurno?: boolean;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  notaSegundaTurno?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  segundaTurnoAplicado?: boolean;

  @ApiPropertyOptional({ enum: EstadoCalificacion2T })
  @IsEnum(EstadoCalificacion2T)
  @IsOptional()
  estado2T?: EstadoCalificacion2T;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  notaDefinitiva?: number;

  @ApiPropertyOptional({ enum: EstadoCalificacionDefinitivo })
  @IsEnum(EstadoCalificacionDefinitivo)
  @IsOptional()
  estadoDefinitivo?: EstadoCalificacionDefinitivo;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  registradoPor?: number;
}