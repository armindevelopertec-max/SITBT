import {
  IsInt,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoEstudiante } from '../../../entidades/estudiante.entidad';

export class CrearEstudianteDto {
  @ApiProperty()
  @IsInt()
  personaId: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(50)
  numeroTituloBachiller?: string;

  @ApiPropertyOptional({ example: '2020-06-15' })
  @IsDateString()
  @IsOptional()
  fechaTituloBachiller?: string;

  @ApiProperty({ example: '2024' })
  @IsString()
  @MaxLength(10)
  gestionAdmision: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(30)
  numeroFolder?: string;

  @ApiPropertyOptional({ example: 'INS-2024-0001' })
  @IsString()
  @IsOptional()
  @MaxLength(30)
  codigoInscripcion?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(30)
  codigoFormulario01?: string;

  @ApiProperty()
  @IsInt()
  carreraId: number;

  @ApiProperty()
  @IsInt()
  planEstudioId: number;

  @ApiProperty({ example: '2024-02-01' })
  @IsDateString()
  fechaAdmision: string;

  @ApiPropertyOptional({ enum: EstadoEstudiante })
  @IsEnum(EstadoEstudiante)
  @IsOptional()
  estado?: EstadoEstudiante;
}
