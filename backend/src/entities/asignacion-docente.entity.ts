import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Personal } from './personal.entity';
import { Materia } from './materia.entity';
import { Grupo } from './grupo.entity';

export enum TeachingAssignmentStatus {
  ACTIVO = 'activo',
  FINALIZADO = 'finalizado',
}

@Entity('teaching_assignments')
export class AsignacionDocente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'teacher_id' })
  teacher_id: number;

  @ManyToOne(() => Personal)
  @JoinColumn({ name: 'teacher_id' })
  docente: Personal;

  @Column()
  subject_id: number;

  @ManyToOne(() => Materia)
  @JoinColumn({ name: 'subject_id' })
  materia: Materia;

  @Column()
  group_id: number;

  @ManyToOne(() => Grupo)
  @JoinColumn({ name: 'group_id' })
  grupo: Grupo;

  @Column({ type: 'varchar', length: 10 })
  gestion: string;

  @Column({ type: 'enum', enum: TeachingAssignmentStatus, default: TeachingAssignmentStatus.ACTIVO })
  status: TeachingAssignmentStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
