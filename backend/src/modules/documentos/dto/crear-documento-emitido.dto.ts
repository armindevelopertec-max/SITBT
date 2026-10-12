import { IsString, IsOptional, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoDocumento, EstadoDocumento } from '../../../entities/emitted-document.entity';

export class CrearDocumentoEmitidoDto {
  @ApiProperty()
  @IsNumber()
  estudiante_id: number;

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
  pdfPath?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  related_payment_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  related_credential_id?: number;
}
