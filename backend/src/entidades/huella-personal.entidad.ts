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

export enum EstadoHuella {
  ACTIVA = 'activa',
  INACTIVA = 'inactiva',
}

/**
 * Huella dactilar enrolada de una persona del personal.
 * `codigoBiometrico` es el identificador que envía el lector (puede haber
 * varias huellas por persona, p. ej. distintos dedos).
 */
@Entity('huellas_personal')
export class HuellaPersonal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'personalId' })
  personalId: number;

  @ManyToOne(() => Personal, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'personalId' })
  personal: Personal;

  @Column({ type: 'varchar', length: 50, unique: true, name: 'codigo_biometrico' })
  codigoBiometrico: string;

  @Column({ type: 'varchar', length: 30, nullable: true, name: 'dedo' })
  dedo: string | null;

  @Column({ type: 'text', nullable: true, name: 'plantilla' })
  plantilla: string | null;

  @Column({ type: 'varchar', length: 20, default: EstadoHuella.ACTIVA, name: 'estado' })
  estado: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
