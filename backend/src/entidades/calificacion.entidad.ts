import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { InscripcionMateria } from './inscripcion-materia.entidad';
import { Personal } from './personal.entidad';

/** Estado de registro de una nota concreta (parcial). */
export enum EstadoRegistroNota {
  SIN_REGISTRAR = 'sin_registrar',
  REGISTRADO = 'registrado',
  AUSENTE = 'ausente',
  JUSTIFICADO = 'justificado',
}

/** Forma en que se obtuvo el promedio semestral. */
export enum MetodoPromedio {
  CALCULADO = 'calculado',
  MANUAL = 'manual',
}

/** Resultado del semestre regular (antes de 2T). */
export enum EstadoCalificacionRegular {
  APROBADO = 'aprobado',
  REPROBADO = 'reprobado',
  NO_PRESENTO = 'no_presento',
  PUEDE_IR_2T = 'puede_ir_2t',
  PENDIENTE = 'pendiente',
}

/** Estado de la evaluación de segundo turno. */
export enum EstadoCalificacion2T {
  NO_CORRESPONDE = 'no_corresponde',
  HABILITADO = 'habilitado',
  CALIFICADO = 'calificado',
  AUSENTE = 'ausente',
  JUSTIFICADO = 'justificado',
}

/** Resultado académico definitivo. */
export enum EstadoCalificacionDefinitivo {
  APROBADO = 'aprobado',
  REPROBADO = 'reprobado',
  NO_PRESENTO = 'no_presento',
  PENDIENTE = 'pendiente',
}

/** Estado de revisión/cierre del registro de un estudiante. */
export enum EstadoRevisionCalificacion {
  SIN_INICIAR = 'sin_iniciar',
  EN_REGISTRO = 'en_registro',
  PENDIENTE_REVISION = 'pendiente_revision',
  CERRADO = 'cerrado',
}

/**
 * Calificación final de un estudiante en una materia impartida. Conserva los
 * dos parciales con su estado de registro, el promedio semestral, la nota de
 * segundo turno y el resultado definitivo, además de la trazabilidad.
 */
@Entity('calificaciones')
export class Calificacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, name: 'inscripcion_materia_id' })
  inscripcionMateriaId: number;

  @ManyToOne(() => InscripcionMateria)
  @JoinColumn({ name: 'inscripcion_materia_id' })
  inscripcionMateria: InscripcionMateria;

  @Column({ type: 'int', nullable: true, name: 'parcial_1' })
  parcial1: number | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: EstadoRegistroNota.SIN_REGISTRAR,
    name: 'parcial_1_estado',
  })
  parcial1Estado: EstadoRegistroNota;

  @Column({ type: 'int', nullable: true, name: 'parcial_2' })
  parcial2: number | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: EstadoRegistroNota.SIN_REGISTRAR,
    name: 'parcial_2_estado',
  })
  parcial2Estado: EstadoRegistroNota;

  @Column({ type: 'int', nullable: true, name: 'promedio_final' })
  promedioFinal: number | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: MetodoPromedio.CALCULADO,
    name: 'promedio_metodo',
  })
  promedioMetodo: MetodoPromedio;

  @Column({ type: 'varchar', length: 30, nullable: true, name: 'observacion' })
  observacion: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true, name: 'estado_regular' })
  estadoRegular: EstadoCalificacionRegular | null;

  @Column({ type: 'boolean', default: false, name: 'apto_segunda_turno' })
  aptoSegundaTurno: boolean;

  @Column({ type: 'int', nullable: true, name: 'nota_segunda_turno' })
  notaSegundaTurno: number | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: EstadoCalificacion2T.NO_CORRESPONDE,
    name: 'estado_2t',
  })
  estado2T: EstadoCalificacion2T;

  @Column({ type: 'boolean', default: false, name: 'segunda_turno_aplicado' })
  segundaTurnoAplicado: boolean;

  @Column({ type: 'int', nullable: true, name: 'nota_definitiva' })
  notaDefinitiva: number | null;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'estado_definitivo' })
  estadoDefinitivo: EstadoCalificacionDefinitivo | null;

  @Column({
    type: 'varchar',
    length: 25,
    default: EstadoRevisionCalificacion.SIN_INICIAR,
    name: 'estado_revision',
  })
  estadoRevision: EstadoRevisionCalificacion;

  @Column({ type: 'int', nullable: true, name: 'registrado_por' })
  registradoPor: number | null;

  @Column({ type: 'int', nullable: true, name: 'docente_id' })
  docenteId: number | null;

  @ManyToOne(() => Personal, { nullable: true })
  @JoinColumn({ name: 'docente_id' })
  docente: Personal | null;

  @Column({ type: 'int', nullable: true, name: 'creado_por_id' })
  creadoPorId: number | null;

  @Column({ type: 'int', nullable: true, name: 'modificado_por_id' })
  modificadoPorId: number | null;

  @CreateDateColumn({ name: 'registrado_en' })
  registradoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
