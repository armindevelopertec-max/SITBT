import { IsInt, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CrearGrupoDto {
  @ApiProperty()
  @IsInt()
  carreraId: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  planEstudioId?: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  materiaId?: number;

  @ApiProperty()
  @IsInt()
  semestre: number;

  @ApiProperty()
  @IsInt()
  turnoId: number;

  @ApiProperty({ example: 'A' })
  @IsString()
  @MaxLength(5)
  paralelo: string;

  @ApiProperty({ example: '2024' })
  @IsString()
  @MaxLength(10)
  gestion: string;

  @ApiPropertyOptional({ example: 'I' })
  @IsString()
  @MaxLength(2)
  @IsOptional()
  periodo?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsInt()
  @IsOptional()
  capacidad?: number;
}
