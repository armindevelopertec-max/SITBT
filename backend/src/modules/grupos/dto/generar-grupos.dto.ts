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
  shift_ids: number[];

  @IsArray()
  @IsNotEmpty()
  parallels: string[];

  @IsInt()
  @IsNotEmpty()
  study_plan_id: number;

  @IsOptional()
  @IsString()
  capacidad?: string;
}
