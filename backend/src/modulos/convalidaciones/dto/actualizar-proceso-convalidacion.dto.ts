import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/** Actualiza campos editables de un proceso de convalidación (en borrador). */
export class ActualizarProcesoConvalidacionDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notas?: string;
}
