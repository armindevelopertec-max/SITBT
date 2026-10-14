import { IsString, IsOptional, IsDateString, IsEnum, IsEmail, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrigenAdmision } from '../../../entities/admission-request.entity';

export class CrearAdmisionDto {
  @ApiProperty()
  @IsString()
  nombre: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apellidoPaterno?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apellidoMaterno?: string;

  @ApiProperty()
  @IsString()
  ci: string;

  @ApiProperty()
  @IsDateString()
  fechaNacimiento: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lugarNacimiento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lugarNacimientoOtro?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  genero?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  estadoCivil?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nacionalidad?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nacionalidadOtra?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiProperty()
  @IsEmail()
  correo: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  direccion?: string;

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
  telefonoTutor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  carreraId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(OrigenAdmision)
  origen?: OrigenAdmision;
}
