import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Estudiante } from './estudiante.entity';
import { Materia } from './materia.entity';
import { Grupo } from './grupo.entity';
import { MateriaPlan } from './materia-plan.entity';

export enum EstadoInscripcion {
  CURSANDO = 'cursando',
  APROBADO = 'aprobado',
  REPROBADO = 'reprobado',
  CONVALIDADA = 'convalidada',
}

@Entity('inscripciones')
export class Inscripcion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'estudiante_id' })
  estudianteId: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @Column({ name: 'materia_id' })
  materiaId: number;

  @ManyToOne(() => Materia)
  @JoinColumn({ name: 'materia_id' })
  materia: Materia;

  @Column({ nullable: true, name: 'materia_plan_id' })
  materiaPlanId: number | null;

  @ManyToOne(() => MateriaPlan, { nullable: true })
  @JoinColumn({ name: 'materia_plan_id' })
  materiaPlan: MateriaPlan;

  @Column({ name: 'grupo_id' })
  grupoId: number;

  @ManyToOne(() => Grupo)
  @JoinColumn({ name: 'grupo_id' })
  grupo: Grupo;

  @Column({ type: 'varchar', length: 10 })
  gestion: string;

  @Column({ type: 'int', name: 'semestre' })
  semestre: number;

  @Column({ type: 'enum', enum: EstadoInscripcion, default: EstadoInscripcion.CURSANDO , name: 'estado' })
  estado: EstadoInscripcion;

  @Column({ type: 'int', nullable: true, name: 'nota_final' })
  final_grade: number;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
