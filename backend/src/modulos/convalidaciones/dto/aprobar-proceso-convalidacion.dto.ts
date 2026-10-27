import { IsInt, IsString, IsOptional, IsDateString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/** Aprueba la matriz de un proceso, dejando constancia de la resolución. */
export class AprobarProcesoConvalidacionDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(50)
  numeroResolucion?: string;

  @ApiPropertyOptional({ example: '2026-06-15' })
  @IsDateString()
  @IsOptional()
  fechaResolucion?: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  aprobadoPor?: number;
}
