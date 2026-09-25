import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoleStatus } from '../../../entities/rol.entity';

export class CreateRoleDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @MaxLength(30)
  code: string;

  @ApiProperty({ example: 'Administrador' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: RoleStatus })
  @IsEnum(RoleStatus)
  @IsOptional()
  status?: RoleStatus;
}