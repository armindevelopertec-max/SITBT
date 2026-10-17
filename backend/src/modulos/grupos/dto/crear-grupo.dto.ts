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

  @ApiProperty({ example: 1, description: 'ID del periodo (gestiones → periodos)' })
  @IsInt()
  periodoId: number;

  @ApiPropertyOptional({ example: 30 })
  @IsInt()
  @IsOptional()
  capacidad?: number;
}
