import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Carrera } from './carrera.entidad';
import { PlanEstudio } from './plan-estudio.entidad';
import { Usuario } from './usuario.entidad';

/** Estado del proceso de convalidación entre dos planes de estudio. */
export enum EstadoProcesoConvalidacion {
  BORRADOR = 'borrador',
  APROBADO = 'aprobado',
  ARCHIVADO = 'archivado',
}

/**
 * Comparación autorizada entre un plan de estudio de origen y uno de destino.
 * Agrupa las equivalencias (`equivalencias_plan`) y conserva su versión: una
 * vez aprobada, los cambios se hacen creando una nueva versión, sin
 * sobrescribir silenciosamente lo ya aplicado.
 */
@Unique('UQ_proceso_convalidacion_version', ['planOrigenId', 'planDestinoId', 'version'])
@Entity('procesos_convalidacion')
export class ProcesoConvalidacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'carrera_id' })
  carreraId: number;

  @ManyToOne(() => Carrera)
  @JoinColumn({ name: 'carrera_id' })
  carrera: Carrera;

  @Column({ name: 'plan_origen_id' })
  planOrigenId: number;

  @ManyToOne(() => PlanEstudio)
  @JoinColumn({ name: 'plan_origen_id' })
  plan_origen: PlanEstudio;

  @Column({ name: 'plan_destino_id' })
  planDestinoId: number;

  @ManyToOne(() => PlanEstudio)
  @JoinColumn({ name: 'plan_destino_id' })
  plan_destino: PlanEstudio;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({
    type: 'enum',
    enum: EstadoProcesoConvalidacion,
    default: EstadoProcesoConvalidacion.BORRADOR,
    name: 'estado',
  })
  estado: EstadoProcesoConvalidacion;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'numero_resolucion' })
  numeroResolucion: string | null;

  @Column({ type: 'date', nullable: true, name: 'fecha_resolucion' })
  fechaResolucion: Date | null;

  @Column({ type: 'int', nullable: true, name: 'aprobado_por' })
  aprobadoPor: number | null;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'aprobado_por' })
  aprobador: Usuario | null;

  @Column({ type: 'timestamp', nullable: true, name: 'aprobado_en' })
  aprobadoEn: Date | null;

  @Column({ type: 'text', nullable: true, name: 'notas' })
  notas: string | null;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
