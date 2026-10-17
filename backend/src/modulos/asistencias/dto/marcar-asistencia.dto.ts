import { IsInt, IsOptional, IsString, IsEnum, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TipoMarcacion } from '../../../entidades/marcacion-personal.entidad';

export class MarcarAsistenciaDto {
  @ApiPropertyOptional({
    description: 'Código que envía el lector biométrico (huella enrolada)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  codigoBiometrico?: string;

  @ApiPropertyOptional({ description: 'ID del personal (marcación manual)' })
  @IsOptional()
  @IsInt()
  personalId?: number;

  @ApiPropertyOptional({
    enum: TipoMarcacion,
    description: 'Forzar el tipo; si se omite se alterna automáticamente',
  })
  @IsOptional()
  @IsEnum(TipoMarcacion)
  tipo?: TipoMarcacion;

  @ApiPropertyOptional({ description: 'Nombre/identificador del dispositivo' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  dispositivo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  observacion?: string;
}
