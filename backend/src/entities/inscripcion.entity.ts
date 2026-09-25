import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Estudiante } from './estudiante.entity';
import { Materia } from './materia.entity';
import { Grupo } from './grupo.entity';

export enum EnrollmentStatus {
  CURSANDO = 'cursando',
  APROBADO = 'aprobado',
  REPROBADO = 'reprobado',
  CONVALIDADA = 'convalidada',
}

@Entity('enrollments')
export class Inscripcion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  student_id: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'student_id' })
  estudiante: Estudiante;

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

  @Column({ type: 'int' })
  semester: number;

  @Column({ type: 'enum', enum: EnrollmentStatus, default: EnrollmentStatus.CURSANDO })
  status: EnrollmentStatus;

  @Column({ type: 'int', nullable: true })
  final_grade: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
