import { IsEnum, IsOptional, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TipoConsentimiento } from '../../../entidades/registro-consentimiento.entidad';

export class ActualizarConsentimientoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(TipoConsentimiento)
  derechoEjercido?: TipoConsentimiento;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  registradoPor?: number;
}
