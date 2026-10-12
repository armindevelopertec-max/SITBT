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
  person_id: number;

  @ApiProperty({ example: 'juanperez' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @ApiProperty({ example: 'securePassword123' })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @ApiPropertyOptional({ enum: EstadoUsuario })
  @IsEnum(EstadoUsuario)
  @IsOptional()
  status?: EstadoUsuario;

  @ApiPropertyOptional({ example: 'estudiante', description: 'Codigo del rol a asignar' })
  @IsString()
  @IsOptional()
  role_code?: string;
}