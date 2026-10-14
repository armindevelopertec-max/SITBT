import { IsInt, IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoInscripcion } from '../../../entities/inscripcion.entity';

export class CrearInscripcionDto {
  @ApiProperty()
  @IsInt()
  estudianteId: number;

  @ApiProperty()
  @IsInt()
  materiaId: number;

  @ApiProperty()
  @IsInt()
  grupoId: number;

  @ApiProperty({ example: '2024' })
  @IsString()
  @MaxLength(10)
  gestion: string;

  @ApiProperty()
  @IsInt()
  semestre: number;

  @ApiPropertyOptional({ enum: EstadoInscripcion })
  @IsEnum(EstadoInscripcion)
  @IsOptional()
  estado?: EstadoInscripcion;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  notaFinal?: number;
}