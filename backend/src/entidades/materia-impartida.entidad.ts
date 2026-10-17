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
import { Grupo } from './grupo.entidad';
import { Materia } from './materia.entidad';
import { MateriaPlan } from './materia-plan.entidad';
import { Periodo } from './periodo.entidad';

export enum EstadoMateriaImpartida {
  ACTIVA = 'activa',
  CERRADA = 'cerrada',
}

/**
 * Materia impartida: instancia de una asignatura oficial de la malla que se
 * dicta a un grupo académico en un periodo concreto. Es la unidad sobre la que
 * se registran docentes, estudiantes y calificaciones.
 */
@Unique('UQ_materia_impartida', ['grupoId', 'materiaId', 'periodoId'])
@Entity('materias_impartidas')
export class MateriaImpartida {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'grupo_id' })
  grupoId: number;

  @ManyToOne(() => Grupo)
  @JoinColumn({ name: 'grupo_id' })
  grupo: Grupo;

  @Column({ name: 'materia_id' })
  materiaId: number;

  @ManyToOne(() => Materia)
  @JoinColumn({ name: 'materia_id' })
  materia: Materia;

  @Column({ type: 'int', nullable: true, name: 'materia_plan_id' })
  materiaPlanId: number | null;

  @ManyToOne(() => MateriaPlan, { nullable: true })
  @JoinColumn({ name: 'materia_plan_id' })
  materiaPlan: MateriaPlan | null;

  @Column({ name: 'periodo_id' })
  periodoId: number;

  @ManyToOne(() => Periodo)
  @JoinColumn({ name: 'periodo_id' })
  periodo: Periodo;

  @Column({ type: 'varchar', length: 10 })
  gestion: string;

  @Column({ type: 'varchar', length: 20, default: EstadoMateriaImpartida.ACTIVA })
  estado: EstadoMateriaImpartida;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
