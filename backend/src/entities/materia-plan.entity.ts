import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PlanEstudio } from './plan-estudio.entity';
import { Materia } from './materia.entity';

@Entity('plan_subjects')
export class MateriaPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  study_plan_id: number;

  @ManyToOne(() => PlanEstudio)
  @JoinColumn({ name: 'study_plan_id' })
  plan_estudio: PlanEstudio;

  @Column()
  subject_id: number;

  @ManyToOne(() => Materia)
  @JoinColumn({ name: 'subject_id' })
  materia: Materia;

  @Column({ type: 'int' })
  semester: number;

  @Column({ type: 'int' })
  weekly_hours: number;

  @Column({ nullable: true, type: 'int' })
  prerequisite_id: number | null;

  @ManyToOne(() => Materia, { nullable: true, eager: false })
  @JoinColumn({ name: 'prerequisite_id' })
  prerequisite: Materia;
}
