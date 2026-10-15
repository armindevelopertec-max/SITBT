import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EnviarCorreoDto {
  @ApiProperty()
  @IsString()
  para: string;

  @ApiProperty()
  @IsString()
  asunto: string;

  @ApiProperty()
  @IsString()
  contenido: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  adjuntos?: { nombreArchivo: string; ruta: string }[];
}

export class EnviarNotificacionDto {
  @ApiProperty()
  @IsNumber()
  estudianteId: number;

  @ApiProperty()
  @IsString()
  tipo: string;

  @ApiProperty()
  @IsString()
  mensaje: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  correo?: string;
}
