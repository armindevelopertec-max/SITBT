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

export enum EstadoPlanEstudio {
  VIGENTE = 'vigente',
  HISTORICO = 'historico',
}

@Entity('study_plans')
export class PlanEstudio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  career_id: number;

  @ManyToOne(() => Carrera)
  @JoinColumn({ name: 'career_id' })
  carrera: Carrera;

  @Column({ type: 'varchar', length: 50 })
  rm_number: string;

  @Column({ type: 'date' })
  rm_date: Date;

  @Column({ type: 'enum', enum: EstadoPlanEstudio, default: EstadoPlanEstudio.VIGENTE })
  status: EstadoPlanEstudio;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
