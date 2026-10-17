import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MateriaImpartida } from './materia-impartida.entidad';

export enum EstadoLibro {
  BORRADOR = 'borrador',
  EN_REGISTRO = 'en_registro',
  PENDIENTE_REVISION = 'pendiente_revision',
  CERRADO = 'cerrado',
  REABIERTO = 'reabierto',
}

/**
 * Libro oficial de calificaciones de una materia impartida. Controla el ciclo
 * de vida del registro de notas (borrador, registro, revisión y cierre).
 */
@Entity('libros_calificaciones')
export class LibroCalificaciones {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, name: 'materia_impartida_id' })
  materiaImpartidaId: number;

  @ManyToOne(() => MateriaImpartida)
  @JoinColumn({ name: 'materia_impartida_id' })
  materiaImpartida: MateriaImpartida;

  @Column({ type: 'varchar', length: 30, default: EstadoLibro.BORRADOR })
  estado: EstadoLibro;

  @Column({ type: 'text', nullable: true })
  observacion: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'cerrado_en' })
  cerradoEn: Date | null;

  @Column({ type: 'int', nullable: true, name: 'cerrado_por' })
  cerradoPor: number | null;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
