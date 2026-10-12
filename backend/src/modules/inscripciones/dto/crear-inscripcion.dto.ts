import { IsInt, IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoInscripcion } from '../../../entities/inscripcion.entity';

export class CrearInscripcionDto {
  @ApiProperty()
  @IsInt()
  student_id: number;

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

  @ApiProperty()
  @IsInt()
  semester: number;

  @ApiPropertyOptional({ enum: EstadoInscripcion })
  @IsEnum(EstadoInscripcion)
  @IsOptional()
  status?: EstadoInscripcion;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  final_grade?: number;
}