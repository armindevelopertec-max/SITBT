import { IsString, IsArray, IsNotEmpty, IsOptional, IsInt, IsNumber, ArrayNotEmpty } from 'class-validator';

export class GenerarGruposDto {
  @IsString()
  @IsNotEmpty()
  gestion: string;

  @IsString()
  @IsNotEmpty()
  periodo: string;

  @IsInt()
  @IsNotEmpty()
  planEstudioId: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  semestres: number[];

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  turnoIds: number[];

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  paralelos: string[];

  @IsOptional()
  @IsString()
  capacidad?: string;
}
