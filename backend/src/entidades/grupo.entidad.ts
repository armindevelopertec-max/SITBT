import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Carrera } from './carrera.entidad';
import { PlanEstudio } from './plan-estudio.entidad';
import { Turno } from './turno.entidad';
import { Materia } from './materia.entidad';

export enum EstadoGrupo {
  ACTIVO = 'activo',
  CERRADO = 'cerrado',
}

@Unique('UQ_grupo_combinacion', ['gestion', 'carreraId', 'semestre', 'turnoId', 'paralelo'])
@Entity('grupos')
export class Grupo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true, name: 'codigo' })
  codigo: string;

  @Column({ name: 'carrera_id' })
  carreraId: number;

  @ManyToOne(() => Carrera)
  @JoinColumn({ name: 'carrera_id' })
  carrera: Carrera;

  @Column({ name: 'plan_estudio_id' })
  planEstudioId: number;

  @ManyToOne(() => PlanEstudio)
  @JoinColumn({ name: 'plan_estudio_id' })
  plan_estudio: PlanEstudio;

  @Column({ nullable: true, name: 'materia_id' })
  materiaId: number;

  @ManyToOne(() => Materia)
  @JoinColumn({ name: 'materia_id' })
  materia: Materia;

  @Column({ type: 'int', name: 'semestre' })
  semestre: number;

  @Column({ name: 'turno_id' })
  turnoId: number;

  @ManyToOne(() => Turno)
  @JoinColumn({ name: 'turno_id' })
  turno: Turno;

  @Column({ type: 'varchar', length: 5, name: 'paralelo' })
  paralelo: string;

  @Column({ type: 'varchar', length: 10 })
  gestion: string;

  @Column({ type: 'varchar', length: 2, default: 'I' })
  periodo: string;

  @Column({ type: 'int', default: 30, name: 'capacidad' })
  capacidad: number;

  @Column({ type: 'varchar', length: 20, name: 'estado', default: EstadoGrupo.ACTIVO })
  estado: EstadoGrupo;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
