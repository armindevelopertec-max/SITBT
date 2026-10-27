import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { ProcesoConvalidacion } from './proceso-convalidacion.entidad';
import { MateriaPlan } from './materia-plan.entidad';

/** Resultado de comparar una asignatura del plan de origen con el de destino. */
export enum ResultadoEquivalencia {
  /** Equivalencia directa aprobada: se reconoce la materia del plan destino. */
  EQUIVALENTE = 'equivalente',
  /** Existe relación, pero requiere validación académica del contenido. */
  REQUIERE_VALIDACION = 'requiere_validacion',
  /** La materia del plan de origen no tiene correspondencia en el destino. */
  SIN_CORRESPONDENCIA = 'sin_correspondencia',
}

/**
 * Regla general de equivalencia entre una asignatura del plan de origen y una
 * del plan de destino, dentro de un proceso de convalidación. Una materia de
 * origen puede relacionarse con varias de destino y viceversa (N:M); para ello
 * se registra una fila por relación.
 */
@Unique('UQ_equivalencia_plan', ['procesoId', 'materiaPlanOrigenId', 'materiaPlanDestinoId'])
@Entity('equivalencias_plan')
export class EquivalenciaPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'proceso_id' })
  procesoId: number;

  @ManyToOne(() => ProcesoConvalidacion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'proceso_id' })
  proceso: ProcesoConvalidacion;

  @Column({ name: 'materia_plan_origen_id' })
  materiaPlanOrigenId: number;

  @ManyToOne(() => MateriaPlan)
  @JoinColumn({ name: 'materia_plan_origen_id' })
  materia_plan_origen: MateriaPlan;

  @Column({ type: 'int', nullable: true, name: 'materia_plan_destino_id' })
  materiaPlanDestinoId: number | null;

  @ManyToOne(() => MateriaPlan, { nullable: true })
  @JoinColumn({ name: 'materia_plan_destino_id' })
  materia_plan_destino: MateriaPlan | null;

  @Column({
    type: 'enum',
    enum: ResultadoEquivalencia,
    default: ResultadoEquivalencia.EQUIVALENTE,
    name: 'resultado',
  })
  resultado: ResultadoEquivalencia;

  @Column({ type: 'text', nullable: true, name: 'observacion' })
  observacion: string | null;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}
