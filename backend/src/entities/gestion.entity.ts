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

  @Column({ type: 'varchar', length: 10, unique: true })
  year: string;

  @Column({ type: 'enum', enum: PeriodType, default: PeriodType.SEMESTRAL })
  period_type: PeriodType;

  @Column({
    type: 'enum',
    enum: GestionStatus,
    default: GestionStatus.PENDIENTE,
  })
  status: GestionStatus;

  @Column({ type: 'boolean', default: false })
  is_current: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => Periodo, (periodo) => periodo.gestion)
  periodos: Periodo[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export { GestionStatus, PeriodType };
