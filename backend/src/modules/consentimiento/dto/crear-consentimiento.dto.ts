import { IsString, IsOptional, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoConsentimiento } from '../../../entities/consent-record.entity';

export class CrearConsentimientoDto {
  @ApiProperty()
  @IsNumber()
  estudianteId: number;

  @ApiProperty()
  @IsString()
  versionPolitica: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ipConsentimiento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nombreTutor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ciTutor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firmaBase64?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  registradoPor?: number;
}
