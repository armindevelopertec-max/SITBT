import { IsArray, IsNotEmpty, IsOptional, IsInt, IsNumber, ArrayNotEmpty, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerarGruposDto {
  @ApiProperty({ example: 1, description: 'ID del periodo (gestiones → periodos)' })
  @IsInt()
  @IsNotEmpty()
  periodoId: number;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  planEstudioId: number;

  @ApiProperty({ example: [1, 2, 3, 4, 5, 6] })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  semestres: number[];

  @ApiProperty({ example: [1] })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  turnoIds: number[];

  @ApiProperty({ example: ['A'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  paralelos: string[];

  @ApiPropertyOptional({ example: '30' })
  @IsOptional()
  @IsString()
  capacidad?: string;
}
