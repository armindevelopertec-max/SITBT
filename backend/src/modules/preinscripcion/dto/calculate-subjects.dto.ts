import { IsInt, IsString, IsOptional } from 'class-validator';
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
  materiaPlanId: number;
  materiaId: number;
  materiaCodigo: string;
  materiaNombre: string;
  semestre: number;
  esReprobada: boolean;
  notaAnteriorReprobada?: number;
  prerrequisitoBloqueado: boolean;
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
