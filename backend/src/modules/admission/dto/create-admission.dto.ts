import { IsString, IsOptional, IsDateString, IsEnum, IsEmail, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdmissionOrigin } from '../../../entities/admission-request.entity';

export class CreateAdmissionDto {
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ci_issued?: string;

  @ApiProperty()
  @IsDateString()
  fechaNacimiento: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiProperty()
  @IsEmail()
  email: string;

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
  @IsString()
  genero?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  carrera_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(AdmissionOrigin)
  origen?: AdmissionOrigin;
}
