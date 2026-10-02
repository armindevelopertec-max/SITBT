import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
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
}
