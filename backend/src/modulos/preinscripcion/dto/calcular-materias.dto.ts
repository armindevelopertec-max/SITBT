import { IsInt, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CalcularMateriasDto {
  @ApiProperty()
  @IsInt()
  estudianteId: number;

  @ApiProperty()
  @IsString()
  gestion: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  periodo?: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  turnoId?: number;
}

export class MateriaAInscribir {
  @ApiProperty()
  @IsInt()
  materiaPlanId: number;

  @ApiProperty()
  @IsInt()
  materiaId: number;

  @ApiProperty()
  @IsString()
  materiaCodigo: string;

  @ApiProperty()
  @IsString()
  materiaNombre: string;

  @ApiProperty()
  @IsInt()
  semestre: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  esReprobada?: boolean;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  notaAnteriorReprobada?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  prerrequisitoBloqueado?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  nombrePrerrequisito?: string;
}

export class ResultadoCalcularMaterias {
  puedeInscribir: boolean;
  semestreActual: number;
  materias: MateriaAInscribir[];
  materiasReprobadas: {
    materiaId: number;
    materiaNombre: string;
    nota: number;
    gestionAnterior: string;
  }[];
  materiasBloqueadas: {
    materiaId: number;
    materiaNombre: string;
    razon: string;
  }[];
  totalReprobadas: number;
  mensaje: string;
}
