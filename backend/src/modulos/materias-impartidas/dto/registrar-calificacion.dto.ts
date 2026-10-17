import { IsInt, IsOptional, IsEnum, IsString, MaxLength, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  EstadoRegistroNota,
  EstadoCalificacion2T,
} from '../../../entidades/calificacion.entidad';

export class RegistrarCalificacionDto {
  @ApiProperty()
  @IsInt()
  inscripcionMateriaId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  parcial1?: number;

  @ApiPropertyOptional({ enum: EstadoRegistroNota })
  @IsOptional()
  @IsEnum(EstadoRegistroNota)
  parcial1Estado?: EstadoRegistroNota;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  parcial2?: number;

  @ApiPropertyOptional({ enum: EstadoRegistroNota })
  @IsOptional()
  @IsEnum(EstadoRegistroNota)
  parcial2Estado?: EstadoRegistroNota;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  notaSegundaTurno?: number;

  @ApiPropertyOptional({ enum: EstadoCalificacion2T })
  @IsOptional()
  @IsEnum(EstadoCalificacion2T)
  estado2T?: EstadoCalificacion2T;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string;
}
