import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Estudiante } from './estudiante.entity';
import { Usuario } from './usuario.entity';
import { Gestion } from './gestion.entity';

export enum EstadoCredencial {
  EMITIDA = 'emitida',
  ANULADA = 'anulada',
  REEMPLAZADA = 'reemplazada',
}

export enum TipoEmisionCredencial {
  PRIMERA = 'primera',
  RENOVACION = 'renovacion',
  REIMPRESION = 'reimpresion',
}

export enum EstadoEntregaCredencial {
  GENERADO = 'generado',
  IMPRESO = 'impreso',
  ENTREGADO = 'entregado',
}

@Entity('credenciales')
export class Credencial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'estudiante_id' })
  estudianteId: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @Column({ type: 'varchar', length: 10 })
  gestion: string;

  @Column({ name: 'gestionId', nullable: true })
  gestionId: number;

  @ManyToOne(() => Gestion)
  @JoinColumn({ name: 'gestionId' })
  gestionRelacionada: Gestion;

  @Column({ type: 'integer', name: 'semestre' })
  semestre: number;

  @Column({ type: 'date', name: 'fechaEmision' })
  fechaEmision: Date;

  @Column({ type: 'date', name: 'validoHasta' })
  validoHasta: Date;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'foto_url' })
  fotoUrl: string;

  @Column({ type: 'enum', enum: EstadoCredencial, default: EstadoCredencial.EMITIDA , name: 'estado' })
  estado: EstadoCredencial;

  @Column({ name: 'emitido_por' })
  emitidoPor: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'emitido_por' })
  emisor: Usuario;

  @Column({ type: 'boolean', default: false, name: 'impreso' })
  impreso: boolean;

  @Column({ type: 'enum', enum: TipoEmisionCredencial, default: TipoEmisionCredencial.PRIMERA })
  tipoEmision: TipoEmisionCredencial;

  @Column({ type: 'varchar', length: 20, nullable: true })
  vigenciaHasta: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  qrVerificacion: string;

  @Column({ type: 'enum', enum: EstadoEntregaCredencial, default: EstadoEntregaCredencial.GENERADO })
  estadoEntrega: EstadoEntregaCredencial;

  @Column({ nullable: true })
  entregadoA: number;

  @Column({ type: 'timestamp', nullable: true })
  fechaEntrega: Date;

  @Column({ type: 'text', nullable: true, name: 'notas' })
  notas: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
