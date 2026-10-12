import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Personal } from './personal.entity';
import { Materia } from './materia.entity';
import { Grupo } from './grupo.entity';

export enum EstadoAsignacionDocente {
  ACTIVO = 'activo',
  FINALIZADO = 'finalizado',
}

@Entity('asignaciones_docentes')
export class AsignacionDocente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'docente_id' })
  teacher_id: number;

  @ManyToOne(() => Personal)
  @JoinColumn({ name: 'docente_id' })
  docente: Personal;

  @Column({ name: 'materia_id' })
  subject_id: number;

  @ManyToOne(() => Materia)
  @JoinColumn({ name: 'materia_id' })
  materia: Materia;

  @Column({ name: 'grupo_id' })
  group_id: number;

  @ManyToOne(() => Grupo)
  @JoinColumn({ name: 'grupo_id' })
  grupo: Grupo;

  @Column({ type: 'varchar', length: 10 })
  gestion: string;

  @Column({ type: 'enum', enum: EstadoAsignacionDocente, default: EstadoAsignacionDocente.ACTIVO, name: 'estado' })
  status: EstadoAsignacionDocente;

  @CreateDateColumn({ name: 'creado_en' })
  created_at: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  updated_at: Date;
}
