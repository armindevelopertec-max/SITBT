import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PlanEstudio } from './plan-estudio.entity';
import { Materia } from './materia.entity';

@Entity('materias_plan')
export class MateriaPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'plan_estudio_id' })
  study_plan_id: number;

  @ManyToOne(() => PlanEstudio)
  @JoinColumn({ name: 'plan_estudio_id' })
  plan_estudio: PlanEstudio;

  @Column({ name: 'materia_id' })
  subject_id: number;

  @ManyToOne(() => Materia)
  @JoinColumn({ name: 'materia_id' })
  materia: Materia;

  @Column({ type: 'int', name: 'semestre' })
  semester: number;

  @Column({ type: 'int', name: 'horas_semanales' })
  weekly_hours: number;

  @Column({ nullable: true, type: 'int', name: 'prerrequisito_id' })
  prerequisite_id: number | null;

  @ManyToOne(() => Materia, { nullable: true, eager: false })
  @JoinColumn({ name: 'prerrequisito_id' })
  prerequisite: Materia;
}
