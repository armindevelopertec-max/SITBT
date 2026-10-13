import { IsString, IsArray, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class GenerarGruposDto {
  @IsString()
  @IsNotEmpty()
  gestion: string;

  @IsString()
  @IsNotEmpty()
  periodo: string;

  @IsArray()
  @IsNotEmpty()
  turnoIds: number[];

  @IsArray()
  @IsNotEmpty()
  paralelos: string[];

  @IsInt()
  @IsNotEmpty()
  planEstudioId: number;

  @IsOptional()
  @IsString()
  capacidad?: string;
}
