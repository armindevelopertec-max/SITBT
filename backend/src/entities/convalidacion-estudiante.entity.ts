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
import { Equivalencia } from './equivalencia.entity';
import { Materia } from './materia.entity';
import { Usuario } from './usuario.entity';

export enum TipoConvalidacion {
  PLAN_MIGRATION = 'plan_migration',
  EXTERNAL_TRANSFER = 'external_transfer',
  TRANSITABILIDAD = 'transitabilidad',
}

export enum EstadoConvalidacion {
  PENDIENTE = 'pendiente',
  APROBADA = 'aprobada',
  RECHAZADA = 'rechazada',
}

@Entity('convalidaciones_estudiante')
export class ConvalidacionEstudiante {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'estudiante_id' })
  student_id: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @Column({ nullable: true, name: 'equivalencia_id' })
  equivalence_id: number;

  @ManyToOne(() => Equivalencia)
  @JoinColumn({ name: 'equivalencia_id' })
  equivalencia: Equivalencia;

  @Column({ name: 'materia_destino_id' })
  target_subject_id: number;

  @ManyToOne(() => Materia)
  @JoinColumn({ name: 'materia_destino_id' })
  materia_destino: Materia;

  @Column({ type: 'enum', enum: TipoConvalidacion , name: 'tipo' })
  type: TipoConvalidacion;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'numero_resolucion' })
  resolution_number: string;

  @Column({ type: 'date', nullable: true, name: 'fecha_resolucion' })
  resolution_date: Date;

  @Column({ type: 'enum', enum: EstadoConvalidacion, default: EstadoConvalidacion.PENDIENTE , name: 'estado' })
  status: EstadoConvalidacion;

  @Column({ nullable: true, name: 'aprobado_por' })
  approved_by: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ })
  aprobador: Usuario;

  @CreateDateColumn({ name: 'creado_en' })
  created_at: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  updated_at: Date;
}
