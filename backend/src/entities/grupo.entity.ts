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

@Entity('grupos')
export class Grupo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true, name: 'codigo' })
  code: string;

  @Column({ name: 'carrera_id' })
  career_id: number;

  @ManyToOne(() => Carrera)
  @JoinColumn({ name: 'carrera_id' })
  carrera: Carrera;

  @Column({ name: 'plan_estudio_id' })
  study_plan_id: number;

  @ManyToOne(() => PlanEstudio)
  @JoinColumn({ name: 'plan_estudio_id' })
  plan_estudio: PlanEstudio;

  @Column({ nullable: true, name: 'materia_id' })
  subject_id: number;

  @ManyToOne(() => Materia)
  @JoinColumn({ name: 'materia_id' })
  materia: Materia;

  @Column({ type: 'int', name: 'semestre' })
  semester: number;

  @Column({ name: 'turno_id' })
  shift_id: number;

  @ManyToOne(() => Turno)
  @JoinColumn({ name: 'turno_id' })
  turno: Turno;

  @Column({ type: 'varchar', length: 5, name: 'paralelo' })
  parallel: string;

  @Column({ type: 'varchar', length: 10 })
  gestion: string;

  @Column({ type: 'varchar', length: 2, default: 'I' })
  periodo: string;

  @Column({ type: 'int', default: 30, name: 'capacidad' })
  capacity: number;

  @CreateDateColumn({ name: 'creado_en' })
  created_at: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  updated_at: Date;
}
