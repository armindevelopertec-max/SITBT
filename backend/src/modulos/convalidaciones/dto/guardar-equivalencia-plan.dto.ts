import { IsInt, IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResultadoEquivalencia } from '../../../entidades/equivalencia-plan.entidad';

/**
 * Registra o reemplaza la equivalencia de una asignatura del plan de origen.
 * Si `materiaPlanDestinoId` se omite, la materia de origen queda sin
 * correspondencia (o con el resultado indicado, p. ej. requiere validación).
 */
export class GuardarEquivalenciaPlanDto {
  @ApiProperty()
  @IsInt()
  materiaPlanOrigenId: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  materiaPlanDestinoId?: number;

  @ApiProperty({ enum: ResultadoEquivalencia })
  @IsEnum(ResultadoEquivalencia)
  resultado: ResultadoEquivalencia;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  observacion?: string;
}
