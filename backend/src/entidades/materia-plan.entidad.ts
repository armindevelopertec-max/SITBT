import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PlanEstudio } from './plan-estudio.entidad';
import { Materia } from './materia.entidad';

@Entity('materias_plan')
export class MateriaPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'plan_estudio_id' })
  planEstudioId: number;

  @ManyToOne(() => PlanEstudio)
  @JoinColumn({ name: 'plan_estudio_id' })
  plan_estudio: PlanEstudio;

  @Column({ name: 'materia_id' })
  materiaId: number;

  @ManyToOne(() => Materia)
  @JoinColumn({ name: 'materia_id' })
  materia: Materia;

  @Column({ type: 'int', name: 'semestre' })
  semestre: number;

  @Column({ type: 'int', name: 'horas_semanales' })
  horasSemanales: number;

  @Column({ nullable: true, type: 'int', name: 'prerrequisito_id' })
  prerrequisitoId: number | null;

  @ManyToOne(() => Materia, { nullable: true, eager: false })
  @JoinColumn({ name: 'prerrequisito_id' })
  prerrequisito: Materia;
}
