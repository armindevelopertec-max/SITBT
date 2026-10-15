import { IsString, IsOptional, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoDocumento, EstadoDocumento } from '../../../entidades/documento-emitido.entidad';

export class CrearDocumentoEmitidoDto {
  @ApiProperty()
  @IsNumber()
  estudianteId: number;

  @ApiProperty({ enum: TipoDocumento })
  @IsEnum(TipoDocumento)
  tipo: TipoDocumento;

  @ApiProperty()
  @IsString()
  numeroDocumento: string;

  @ApiProperty()
  @IsString()
  gestion: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  gestionId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rutaPdf?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  pagoRelacionadoId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  credencialRelacionadaId?: number;
}
