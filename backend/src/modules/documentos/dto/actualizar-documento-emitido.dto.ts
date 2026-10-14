import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoDocumento } from '../../../entities/emitted-document.entity';

export class ActualizarDocumentoEmitidoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(EstadoDocumento)
  estado?: EstadoDocumento;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entregadoA?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rutaPdf?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  impresoPor?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;
}
