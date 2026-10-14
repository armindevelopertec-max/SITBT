import { IsString, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoAdmision } from '../../../entities/admission-request.entity';

export class ActualizarAdmisionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(EstadoAdmision)
  estado?: EstadoAdmision;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  verificadoPor?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  carreraId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apellidoPaterno?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apellidoMaterno?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ci?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  correo?: string;

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
}
