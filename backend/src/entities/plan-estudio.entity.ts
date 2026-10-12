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

@Entity('planes_estudio')
export class PlanEstudio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'carrera_id' })
  career_id: number;

  @ManyToOne(() => Carrera)
  @JoinColumn({ name: 'carrera_id' })
  carrera: Carrera;

  @Column({ type: 'varchar', length: 50, name: 'numero_rm' })
  rm_number: string;

  @Column({ type: 'date', name: 'fecha_rm' })
  rm_date: Date;

  @Column({ type: 'enum', enum: EstadoPlanEstudio, default: EstadoPlanEstudio.VIGENTE , name: 'estado' })
  status: EstadoPlanEstudio;

  @Column({ type: 'text', nullable: true, name: 'notas' })
  notes: string;

  @CreateDateColumn({ name: 'creado_en' })
  created_at: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  updated_at: Date;
}
