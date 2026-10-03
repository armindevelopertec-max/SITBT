import { IsString, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AdmissionStatus } from '../../../entities/admission-request.entity';

export class UpdateAdmissionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(AdmissionStatus)
  estado?: AdmissionStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  verificado_por?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  carrera_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  names?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastname_paternal?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastname_maternal?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ci?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  birthdate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  birthplace?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  marital_status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

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
}
