import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Periodo } from './periodo.entidad';
import { EstadoGestion } from './enumeraciones/estado-gestion.enumeracion';
import { TipoPeriodo } from './enumeraciones/tipo-periodo.enumeracion';

@Entity('gestiones')
export class Gestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 10, unique: true, name: 'anio' })
  anio: string;

  @Column({ type: 'enum', enum: TipoPeriodo, default: TipoPeriodo.SEMESTRAL, name: 'tipo_periodo' })
  tipoPeriodo: TipoPeriodo;

  @Column('enum', {
    enum: EstadoGestion,
    default: EstadoGestion.PENDIENTE,
    name: 'estado',
  })
  estado: EstadoGestion;

  @Column({ type: 'boolean', default: false, name: 'es_actual' })
  esActual: boolean;

  @Column({ type: 'text', nullable: true, name: 'notas' })
  notas: string;

  @OneToMany(() => Periodo, (periodo) => periodo.gestion)
  periodos: Periodo[];

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}

export { EstadoGestion, TipoPeriodo };
