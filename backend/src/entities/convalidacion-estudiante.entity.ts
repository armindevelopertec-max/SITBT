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

export enum ConvalidationType {
  PLAN_MIGRATION = 'plan_migration',
  EXTERNAL_TRANSFER = 'external_transfer',
  TRANSITABILIDAD = 'transitabilidad',
}

export enum ConvalidationStatus {
  PENDIENTE = 'pendiente',
  APROBADA = 'aprobada',
  RECHAZADA = 'rechazada',
}

@Entity('student_convalidations')
export class ConvalidacionEstudiante {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  student_id: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'student_id' })
  estudiante: Estudiante;

  @Column({ nullable: true })
  equivalence_id: number;

  @ManyToOne(() => Equivalencia)
  @JoinColumn({ name: 'equivalence_id' })
  equivalencia: Equivalencia;

  @Column({ name: 'target_subject_id' })
  target_subject_id: number;

  @ManyToOne(() => Materia)
  @JoinColumn({ name: 'target_subject_id' })
  materia_destino: Materia;

  @Column({ type: 'enum', enum: ConvalidationType })
  type: ConvalidationType;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'resolution_number' })
  resolution_number: string;

  @Column({ type: 'date', nullable: true, name: 'resolution_date' })
  resolution_date: Date;

  @Column({ type: 'enum', enum: ConvalidationStatus, default: ConvalidationStatus.PENDIENTE })
  status: ConvalidationStatus;

  @Column({ nullable: true })
  approved_by: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'approved_by' })
  aprobador: Usuario;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
