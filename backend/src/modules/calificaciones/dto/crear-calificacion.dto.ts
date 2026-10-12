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
  partial_1?: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  partial_2?: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  final_average?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(30)
  observation?: string;

  @ApiPropertyOptional({ enum: EstadoCalificacionRegular })
  @IsEnum(EstadoCalificacionRegular)
  @IsOptional()
  status_regular?: EstadoCalificacionRegular;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  second_turn_eligible?: boolean;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  second_turn_score?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  second_turn_applied?: boolean;

  @ApiPropertyOptional({ enum: EstadoCalificacion2T })
  @IsEnum(EstadoCalificacion2T)
  @IsOptional()
  status_2t?: EstadoCalificacion2T;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  definitive_grade?: number;

  @ApiPropertyOptional({ enum: EstadoCalificacionDefinitivo })
  @IsEnum(EstadoCalificacionDefinitivo)
  @IsOptional()
  status_definitivo?: EstadoCalificacionDefinitivo;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  registered_by?: number;
}