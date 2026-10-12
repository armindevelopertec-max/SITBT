import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Periodo } from './periodo.entity';
import { GestionStatus } from './enums/gestion-status.enum';
import { PeriodType } from './enums/period-type.enum';

@Entity('gestiones')
export class Gestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 10, unique: true, name: 'anio' })
  year: string;

  @Column({ type: 'enum', enum: PeriodType, default: PeriodType.SEMESTRAL, name: 'tipo_periodo' })
  period_type: PeriodType;

  @Column({
    type: 'enum',
    enum: GestionStatus,
    default: GestionStatus.PENDIENTE,
    name: 'estado',
  })
  status: GestionStatus;

  @Column({ type: 'boolean', default: false, name: 'es_actual' })
  is_current: boolean;

  @Column({ type: 'text', nullable: true, name: 'notas' })
  notes: string;

  @OneToMany(() => Periodo, (periodo) => periodo.gestion)
  periodos: Periodo[];

  @CreateDateColumn({ name: 'creado_en' })
  created_at: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  updated_at: Date;
}

export { GestionStatus, PeriodType };
