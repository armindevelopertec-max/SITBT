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
  carreraId: number;

  @ManyToOne(() => Carrera)
  @JoinColumn({ name: 'carrera_id' })
  carrera: Carrera;

  @Column({ type: 'varchar', length: 50, name: 'numero_rm' })
  numeroRm: string;

  @Column({ type: 'date', name: 'fecha_rm' })
  fechaRm: Date;

  @Column({ type: 'enum', enum: EstadoPlanEstudio, default: EstadoPlanEstudio.VIGENTE , name: 'estado' })
  estado: EstadoPlanEstudio;

  @Column({ type: 'text', nullable: true, name: 'notas' })
  notas: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
