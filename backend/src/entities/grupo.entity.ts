import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Carrera } from './carrera.entity';
import { PlanEstudio } from './plan-estudio.entity';
import { Turno } from './turno.entity';
import { Materia } from './materia.entity';

@Entity('groups')
export class Grupo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  code: string;

  @Column()
  career_id: number;

  @ManyToOne(() => Carrera)
  @JoinColumn({ name: 'career_id' })
  carrera: Carrera;

  @Column()
  study_plan_id: number;

  @ManyToOne(() => PlanEstudio)
  @JoinColumn({ name: 'study_plan_id' })
  plan_estudio: PlanEstudio;

  @Column({ nullable: true })
  subject_id: number;

  @ManyToOne(() => Materia)
  @JoinColumn({ name: 'subject_id' })
  materia: Materia;

  @Column({ type: 'int' })
  semester: number;

  @Column()
  shift_id: number;

  @ManyToOne(() => Turno)
  @JoinColumn({ name: 'shift_id' })
  turno: Turno;

  @Column({ type: 'varchar', length: 5 })
  parallel: string;

  @Column({ type: 'varchar', length: 10 })
  gestion: string;

  @Column({ type: 'varchar', length: 2, default: 'I' })
  periodo: string;

  @Column({ type: 'int', default: 30 })
  capacity: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
