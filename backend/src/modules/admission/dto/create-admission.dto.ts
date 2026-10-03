import { IsString, IsOptional, IsDateString, IsEnum, IsEmail, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdmissionOrigin } from '../../../entities/admission-request.entity';

export class CreateAdmissionDto {
  @ApiProperty()
  @IsString()
  names: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastname_paternal?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastname_maternal?: string;

  @ApiProperty()
  @IsString()
  ci: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ci_issued?: string;

  @ApiProperty()
  @IsDateString()
  birthdate: string;

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

  @ApiProperty()
  @IsEmail()
  email: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  carrera_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(AdmissionOrigin)
  origen?: AdmissionOrigin;
}
