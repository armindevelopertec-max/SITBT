import { IsString, IsOptional, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConsentType } from '../../../entities/consent-record.entity';

export class CreateConsentDto {
  @ApiProperty()
  @IsNumber()
  estudiante_id: number;

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
  registrado_por?: number;
}
