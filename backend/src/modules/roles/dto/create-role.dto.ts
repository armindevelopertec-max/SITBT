import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoRol } from '../../../entities/rol.entity';

export class CrearRolDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @MaxLength(30)
  codigo: string;

  @ApiProperty({ example: 'Administrador' })
  @IsString()
  @MaxLength(50)
  nombre: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({ enum: EstadoRol })
  @IsEnum(EstadoRol)
  @IsOptional()
  estado?: EstadoRol;
}