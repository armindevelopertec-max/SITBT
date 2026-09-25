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

@Entity('groups')
export class Grupo {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({ type: 'int', default: 30 })
  capacity: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
