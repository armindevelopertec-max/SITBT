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
import { MateriaPlan } from './materia-plan.entity';

export enum EstadoInscripcion {
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

  @Column({ nullable: true })
  plan_subject_id: number | null;

  @ManyToOne(() => MateriaPlan, { nullable: true })
  @JoinColumn({ name: 'plan_subject_id' })
  materiaPlan: MateriaPlan;

  @Column()
  group_id: number;

  @ManyToOne(() => Grupo)
  @JoinColumn({ name: 'group_id' })
  grupo: Grupo;

  @Column({ type: 'varchar', length: 10 })
  gestion: string;

  @Column({ type: 'int' })
  semester: number;

  @Column({ type: 'enum', enum: EstadoInscripcion, default: EstadoInscripcion.CURSANDO })
  status: EstadoInscripcion;

  @Column({ type: 'int', nullable: true })
  final_grade: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
