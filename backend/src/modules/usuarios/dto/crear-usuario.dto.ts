import {
  IsInt,
  IsString,
  IsOptional,
  IsEnum,
  MaxLength,
  MinLength,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoUsuario } from '../../../entities/usuario.entity';

export class CrearUsuarioDto {
  @ApiProperty()
  @IsInt()
  personaId: number;

  @ApiProperty({ example: 'juanperez' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  nombreUsuario: string;

  @ApiProperty({ example: 'ContrasenaSegura123' })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  contrasena: string;

  @ApiPropertyOptional({ enum: EstadoUsuario })
  @IsEnum(EstadoUsuario)
  @IsOptional()
  estado?: EstadoUsuario;

  @ApiPropertyOptional({ example: 'estudiante', description: 'Codigo del rol a asignar' })
  @IsString()
  @IsOptional()
  codigoRol?: string;
}