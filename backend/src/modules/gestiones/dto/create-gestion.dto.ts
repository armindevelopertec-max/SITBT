import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoGestion } from '../../../entities/enums/estado-gestion.enum';
import { TipoPeriodo } from '../../../entities/enums/tipo-periodo.enum';

export class CrearGestionDto {
  @ApiProperty({ example: '2025' })
  @IsString()
  @MaxLength(10)
  anio: string;

  @ApiPropertyOptional({ enum: TipoPeriodo, default: TipoPeriodo.SEMESTRAL })
  @IsEnum(TipoPeriodo)
  @IsOptional()
  tipoPeriodo?: TipoPeriodo;

  @ApiPropertyOptional({ enum: EstadoGestion, default: EstadoGestion.PENDIENTE })
  @IsEnum(EstadoGestion)
  @IsOptional()
  estado?: EstadoGestion;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  esActual?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notas?: string;
}
