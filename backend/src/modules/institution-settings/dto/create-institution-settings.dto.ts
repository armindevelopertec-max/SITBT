import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInstitutionSettingsDto {
  @ApiProperty({ description: 'Nombre completo de la institución', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  nombre: string;

  @ApiProperty({ description: 'Nombre corto o sigla', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  nombre_corto: string;

  @ApiPropertyOptional({ description: 'Lema de la institución', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  lema?: string;

  @ApiPropertyOptional({ description: 'URL del logo (MinIO)', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logo_url?: string;

  @ApiPropertyOptional({ description: 'Dirección de la institución', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  direccion?: string;

  @ApiPropertyOptional({ description: 'Teléfono de contacto', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  telefono?: string;

  @ApiPropertyOptional({ description: 'Departamento', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  departamento?: string;

  @ApiPropertyOptional({ description: 'Email de contacto', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({ description: 'Sitio web', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  website?: string;

  @ApiPropertyOptional({ description: 'Ciudad', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ciudad?: string;

  @ApiPropertyOptional({ description: 'País', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  pais?: string;

  @ApiPropertyOptional({ description: 'Descripción de la institución' })
  @IsOptional()
  @IsString()
  descripcion?: string;
}
