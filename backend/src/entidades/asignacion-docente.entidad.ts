import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Personal } from './personal.entidad';
import { Materia } from './materia.entidad';
import { Grupo } from './grupo.entidad';
import { MateriaImpartida } from './materia-impartida.entidad';

export enum EstadoAsignacionDocente {
  ACTIVO = 'activo',
  FINALIZADO = 'finalizado',
  ANULADO = 'anulado',
}

/**
 * Asignación de un docente a una materia impartida, con vigencia (fecha de
 * inicio y fin), carga horaria y observación. Los cambios de docente cierran la
 * asignación anterior en lugar de sobrescribirla, conservando el historial.
 */
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

  @Column({ type: 'int', nullable: true, name: 'materia_impartida_id' })
  materiaImpartidaId: number | null;

  @ManyToOne(() => MateriaImpartida, { nullable: true })
  @JoinColumn({ name: 'materia_impartida_id' })
  materiaImpartida: MateriaImpartida | null;

  @Column({ type: 'varchar', length: 10 })
  gestion: string;

  @Column({ type: 'date', nullable: true, name: 'fecha_inicio' })
  fechaInicio: string | null;

  @Column({ type: 'date', nullable: true, name: 'fecha_fin' })
  fechaFin: string | null;

  @Column({ type: 'int', nullable: true, name: 'carga_horaria' })
  cargaHoraria: number | null;

  @Column({ type: 'text', nullable: true, name: 'observacion' })
  observacion: string | null;

  @Column({ type: 'varchar', length: 20, default: EstadoAsignacionDocente.ACTIVO, name: 'estado' })
  estado: EstadoAsignacionDocente;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
