import { IsInt, IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoAsignacionDocente } from '../../../entities/asignacion-docente.entity';

export class CrearAsignacionDocenteDto {
  @ApiProperty()
  @IsInt()
  teacher_id: number;

  @ApiProperty()
  @IsInt()
  subject_id: number;

  @ApiProperty()
  @IsInt()
  group_id: number;

  @ApiProperty({ example: '2024' })
  @IsString()
  @MaxLength(10)
  gestion: string;

  @ApiPropertyOptional({ enum: EstadoAsignacionDocente })
  @IsEnum(EstadoAsignacionDocente)
  @IsOptional()
  status?: EstadoAsignacionDocente;
}