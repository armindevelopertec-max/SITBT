import { IsEnum, IsOptional, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TipoConsentimiento } from '../../../entities/consent-record.entity';

export class ActualizarConsentimientoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(TipoConsentimiento)
  derechoEjercido?: TipoConsentimiento;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  registrado_por?: number;
}
