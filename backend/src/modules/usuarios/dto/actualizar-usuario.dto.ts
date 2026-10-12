import { PartialType } from '@nestjs/swagger';
import { CrearUsuarioDto } from './crear-usuario.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class ActualizarUsuarioDto extends PartialType(CrearUsuarioDto) {
  @ApiPropertyOptional({ example: 'newPassword123' })
  @IsString()
  @IsOptional()
  password?: string;
}