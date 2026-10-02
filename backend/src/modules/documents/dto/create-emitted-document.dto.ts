import { IsString, IsOptional, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType, DocumentStatus } from '../../../entities/emitted-document.entity';

export class CreateEmittedDocumentDto {
  @ApiProperty()
  @IsNumber()
  estudiante_id: number;

  @ApiProperty({ enum: DocumentType })
  @IsEnum(DocumentType)
  tipo: DocumentType;

  @ApiProperty()
  @IsString()
  numeroDocumento: string;

  @ApiProperty()
  @IsString()
  gestion: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  gestion_id?: number;

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
