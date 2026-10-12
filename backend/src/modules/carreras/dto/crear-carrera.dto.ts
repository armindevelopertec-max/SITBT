import { IsString, IsOptional, IsEnum, IsInt, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoCarrera } from '../../../entities/carrera.entity';

export class CrearCarreraDto {
  @ApiProperty({ example: 'INF' })
  @IsString()
  @MaxLength(10)
  code: string;

  @ApiProperty({ example: 'Ingeniería Informática' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  area?: string;

  @ApiProperty({ example: 'Ingeniero en Informática' })
  @IsString()
  @MaxLength(150)
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 3600 })
  @IsInt()
  @IsOptional()
  load_hours?: number;

  @ApiPropertyOptional({ enum: EstadoCarrera })
  @IsEnum(EstadoCarrera)
  @IsOptional()
  status?: EstadoCarrera;
}