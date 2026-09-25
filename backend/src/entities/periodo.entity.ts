import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Gestion } from './gestion.entity';
import { GestionStatus } from './enums/gestion-status.enum';

@Entity('periodos')
export class Periodo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'gestion_id' })
  gestion_id: number;

  @ManyToOne(() => Gestion, (gestion) => gestion.periodos)
  @JoinColumn({ name: 'gestion_id' })
  gestion: Gestion;

  @Column({ type: 'varchar', length: 10 })
  number: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  name: string;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @Column({
    type: 'enum',
    enum: GestionStatus,
    default: GestionStatus.PENDIENTE,
  })
  status: GestionStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
