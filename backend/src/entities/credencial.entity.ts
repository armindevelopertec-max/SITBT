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
  student_id: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @Column({ type: 'varchar', length: 10 })
  gestion: string;

  @Column({ name: 'gestion_id', nullable: true })
  gestion_id: number;

  @ManyToOne(() => Gestion)
  @JoinColumn({ name: 'gestion_id' })
  gestionEntity: Gestion;

  @Column({ type: 'integer', name: 'semestre' })
  semester: number;

  @Column({ type: 'date', name: 'fecha_emision' })
  issued_date: Date;

  @Column({ type: 'date', name: 'valido_hasta' })
  valid_until: Date;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'foto_url' })
  photo_url: string;

  @Column({ type: 'enum', enum: EstadoCredencial, default: EstadoCredencial.EMITIDA , name: 'estado' })
  status: EstadoCredencial;

  @Column({ name: 'emitido_por' })
  issued_by: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'emitido_por' })
  emisor: Usuario;

  @Column({ type: 'boolean', default: false, name: 'impreso' })
  printed: boolean;

  @Column({ type: 'enum', enum: TipoEmisionCredencial, default: TipoEmisionCredencial.PRIMERA })
  tipo_emision: TipoEmisionCredencial;

  @Column({ type: 'varchar', length: 20, nullable: true })
  vigencia_hasta: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  qr_verificacion: string;

  @Column({ type: 'enum', enum: EstadoEntregaCredencial, default: EstadoEntregaCredencial.GENERADO })
  estado_entrega: EstadoEntregaCredencial;

  @Column({ nullable: true })
  entregadoA: number;

  @Column({ type: 'timestamp', nullable: true })
  fechaEntrega: Date;

  @Column({ type: 'text', nullable: true, name: 'notas' })
  notes: string;

  @CreateDateColumn({ name: 'creado_en' })
  created_at: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  updated_at: Date;
}
