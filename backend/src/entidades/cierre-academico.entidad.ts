import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LibroCalificaciones } from './libro-calificaciones.entidad';
import { Usuario } from './usuario.entidad';

export enum AccionCierreAcademico {
  CERRAR = 'cerrar',
  REABRIR = 'reabrir',
}

/**
 * Historial de cierres y reaperturas de un libro de calificaciones, con la
 * autorización y el motivo correspondiente.
 */
@Entity('cierres_academicos')
export class CierreAcademico {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'libro_id' })
  libroId: number;

  @ManyToOne(() => LibroCalificaciones)
  @JoinColumn({ name: 'libro_id' })
  libro: LibroCalificaciones;

  @Column({ type: 'varchar', length: 20 })
  accion: AccionCierreAcademico;

  @Column({ type: 'text', nullable: true })
  motivo: string | null;

  @Column({ type: 'int', nullable: true, name: 'autorizado_por' })
  autorizadoPor: number | null;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'autorizado_por' })
  autorizador: Usuario | null;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}
