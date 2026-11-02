import {
  IsInt,
  IsString,
  IsArray,
  IsOptional,
  ValidateNested,
  ArrayNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MateriaAInscribir } from './calcular-materias.dto';

/**
 * Conjunto de materias que el estudiante cursará en un mismo grupo.
 * El grupo es por semestre/paralelo, por lo que un estudiante con materias
 * de varios semestres (p. ej. reprobadas + semestre actual) tendrá una
 * asignación por cada grupo/semestre.
 */
export class AsignacionGrupoDto {
  @ApiProperty()
  @IsInt()
  grupoId: number;

  @ApiProperty({ type: [MateriaAInscribir] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => MateriaAInscribir)
  materias: MateriaAInscribir[];
}

export class CrearInscripcionLoteDto {
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

  /**
   * Usuario que registra los pagos de la inscripción. Si se envía, los
   * conceptos pendientes de pago se registran automáticamente al confirmar
   * la inscripción.
   */
  @ApiPropertyOptional({ description: 'Usuario que recibe los pagos' })
  @IsOptional()
  @IsInt()
  recibidoPor?: number;

  /**
   * Registrar automáticamente los pagos pendientes (matrícula y matrícula
   * semestral) al confirmar la inscripción.
   */
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  registrarPagos?: boolean;

  @ApiPropertyOptional({ type: [AsignacionGrupoDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AsignacionGrupoDto)
  @IsOptional()
  asignaciones?: AsignacionGrupoDto[];

  /**
   * Compatibilidad con el contrato anterior: un único grupo para todas las
   * materias. Si se envía `asignaciones`, estos campos se ignoran.
   */
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  grupoId?: number;

  @ApiPropertyOptional({ type: [MateriaAInscribir] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MateriaAInscribir)
  materias?: MateriaAInscribir[];
}

export class ResultadoCrearInscripcion {
  exito: boolean;
  inscripciones: {
    id: number;
    materiaNombre: string;
    nombreGrupo: string;
  }[];
  boletaId?: string;
  boletaNumero?: string;
  asignadosGrupo: number;
  inscritosLibro: number;
  /** Pagos registrados automáticamente al confirmar la inscripción. */
  pagosRegistrados?: Array<{ concepto: string; monto: number }>;
  mensaje: string;
}
