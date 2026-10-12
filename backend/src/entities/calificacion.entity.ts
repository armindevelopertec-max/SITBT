import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Inscripcion } from './inscripcion.entity';
import { Personal } from './personal.entity';

export enum EstadoCalificacionRegular {
  APROBADO = 'aprobado',
  REPROBADO = 'reprobado',
  NO_PRESENTO = 'no_presento',
}

export enum EstadoCalificacion2T {
  APROBADO = 'aprobado',
  REPROBADO = 'reprobado',
  NO_PRESENTO = 'no_presento',
  NO_APLICA = 'no_aplica',
}

export enum EstadoCalificacionDefinitivo {
  APROBADO = 'aprobado',
  REPROBADO = 'reprobado',
  NO_PRESENTO = 'no_presento',
}

@Entity('calificaciones')
export class Calificacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'inscripcion_id' })
  enrollment_id: number;

  @ManyToOne(() => Inscripcion)
  @JoinColumn({ name: 'inscripcion_id' })
  inscripcion: Inscripcion;

  @Column({ type: 'int', nullable: true, name: 'parcial_1' })
  partial_1: number;

  @Column({ type: 'int', nullable: true, name: 'parcial_2' })
  partial_2: number;

  @Column({ type: 'int', nullable: true, name: 'promedio_final' })
  final_average: number;

  @Column({ type: 'varchar', length: 30, nullable: true, name: 'observacion' })
  observation: string;

  @Column({ type: 'enum', enum: EstadoCalificacionRegular, nullable: true, name: 'estado_regular' })
  status_regular: EstadoCalificacionRegular;

  @Column({ type: 'boolean', default: false, name: 'apto_segunda_turno' })
  second_turn_eligible: boolean;

  @Column({ type: 'int', nullable: true, name: 'nota_segunda_turno' })
  second_turn_score: number;

  @Column({ type: 'boolean', default: false, name: 'segunda_turno_aplicado' })
  second_turn_applied: boolean;

  @Column({ type: 'enum', enum: EstadoCalificacion2T, default: EstadoCalificacion2T.NO_APLICA, name: 'estado_2t' })
  status_2t: EstadoCalificacion2T;

  @Column({ type: 'int', nullable: true, name: 'nota_definitiva' })
  definitive_grade: number;

  @Column({ type: 'enum', enum: EstadoCalificacionDefinitivo, nullable: true, name: 'estado_definitivo' })
  status_definitivo: EstadoCalificacionDefinitivo;

  @Column({ nullable: true })
  registered_by: number;

  @ManyToOne(() => Personal)
  @JoinColumn({ })
  docente: Personal;

  @CreateDateColumn({ name: 'registrado_en' })
  registered_at: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  updated_at: Date;
}
