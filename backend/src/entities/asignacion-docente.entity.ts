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
  docenteId: number;

  @ManyToOne(() => Personal)
  @JoinColumn({ name: 'docente_id' })
  docente: Personal;

  @Column({ name: 'materia_id' })
  materiaId: number;

  @ManyToOne(() => Materia)
  @JoinColumn({ name: 'materia_id' })
  materia: Materia;

  @Column({ name: 'grupo_id' })
  grupoId: number;

  @ManyToOne(() => Grupo)
  @JoinColumn({ name: 'grupo_id' })
  grupo: Grupo;

  @Column({ type: 'varchar', length: 10 })
  gestion: string;

  @Column({ type: 'enum', enum: EstadoAsignacionDocente, default: EstadoAsignacionDocente.ACTIVO, name: 'estado' })
  estado: EstadoAsignacionDocente;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
