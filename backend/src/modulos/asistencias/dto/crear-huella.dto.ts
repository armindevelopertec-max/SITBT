import { IsInt, IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoHuella } from '../../../entidades/huella-personal.entidad';

export class CrearHuellaDto {
  @ApiProperty()
  @IsInt()
  personalId: number;

  @ApiProperty({
    description: 'Identificador de usuario que enviará el lector biométrico',
    example: '1001',
  })
  @IsString()
  @MaxLength(50)
  codigoBiometrico: string;

  @ApiPropertyOptional({
    description: 'Dedo enrolado (ej. pulgar_derecho)',
    example: 'pulgar_derecho',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  dedo?: string;

  @ApiPropertyOptional({ description: 'Plantilla de la huella (opcional)' })
  @IsOptional()
  @IsString()
  plantilla?: string;

  @ApiPropertyOptional({ enum: EstadoHuella })
  @IsOptional()
  @IsEnum(EstadoHuella)
  estado?: EstadoHuella;
}
