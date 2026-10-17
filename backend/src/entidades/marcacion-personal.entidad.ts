import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Personal } from './personal.entidad';
import { HuellaPersonal } from './huella-personal.entidad';

export enum TipoMarcacion {
  ENTRADA = 'entrada',
  SALIDA = 'salida',
}

export enum MetodoMarcacion {
  BIOMETRICO = 'biometrico',
  MANUAL = 'manual',
}

/**
 * Cada marcación (entrada o salida) del personal es un evento independiente.
 * Si proviene de un lector biométrico, queda enlazada a la huella que la originó.
 */
@Entity('marcaciones_personal')
@Index(['personalId', 'fechaHora'])
export class MarcacionPersonal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'personalId' })
  personalId: number;

  @ManyToOne(() => Personal, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'personalId' })
  personal: Personal;

  @Column({ type: 'int', nullable: true, name: 'huellaId' })
  huellaId: number | null;

  @ManyToOne(() => HuellaPersonal, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'huellaId' })
  huella: HuellaPersonal | null;

  @Column({ type: 'varchar', length: 10, name: 'tipo' })
  tipo: TipoMarcacion;

  @Column({
    type: 'varchar',
    length: 20,
    default: MetodoMarcacion.BIOMETRICO,
    name: 'metodo',
  })
  metodo: MetodoMarcacion;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'dispositivo' })
  dispositivo: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'observacion' })
  observacion: string | null;

  @Column({ type: 'timestamptz', name: 'fecha_hora' })
  fechaHora: Date;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}
