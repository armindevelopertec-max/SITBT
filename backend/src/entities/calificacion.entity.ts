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
  inscripcionId: number;

  @ManyToOne(() => Inscripcion)
  @JoinColumn({ name: 'inscripcion_id' })
  inscripcion: Inscripcion;

  @Column({ type: 'int', nullable: true, name: 'parcial_1' })
  parcial1: number;

  @Column({ type: 'int', nullable: true, name: 'parcial_2' })
  parcial2: number;

  @Column({ type: 'int', nullable: true, name: 'promedio_final' })
  promedioFinal: number;

  @Column({ type: 'varchar', length: 30, nullable: true, name: 'observacion' })
  observacion: string;

  @Column({ type: 'enum', enum: EstadoCalificacionRegular, nullable: true, name: 'estado_regular' })
  estadoRegular: EstadoCalificacionRegular;

  @Column({ type: 'boolean', default: false, name: 'apto_segunda_turno' })
  aptoSegundaTurno: boolean;

  @Column({ type: 'int', nullable: true, name: 'nota_segunda_turno' })
  notaSegundaTurno: number;

  @Column({ type: 'boolean', default: false, name: 'segunda_turno_aplicado' })
  segundaTurnoAplicado: boolean;

  @Column({ type: 'enum', enum: EstadoCalificacion2T, default: EstadoCalificacion2T.NO_APLICA, name: 'estado_2t' })
  estado2T: EstadoCalificacion2T;

  @Column({ type: 'int', nullable: true, name: 'nota_definitiva' })
  notaDefinitiva: number;

  @Column({ type: 'enum', enum: EstadoCalificacionDefinitivo, nullable: true, name: 'estado_definitivo' })
  estadoDefinitivo: EstadoCalificacionDefinitivo;

  @Column({ nullable: true })
  registradoPor: number;

  @ManyToOne(() => Personal)
  @JoinColumn({ })
  docente: Personal;

  @CreateDateColumn({ name: 'registrado_en' })
  registradoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
