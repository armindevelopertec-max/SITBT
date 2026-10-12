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

  @Column({ type: 'varchar', length: 10, name: 'numero' })
  number: string;

  @Column({ type: 'varchar', length: 50, nullable: true , name: 'nombre' })
  name: string;

  @Column({ type: 'date', name: 'fecha_inicio' })
  start_date: Date;

  @Column({ type: 'date', name: 'fecha_fin' })
  end_date: Date;

  @Column({
    type: 'enum',
    enum: GestionStatus,
    default: GestionStatus.PENDIENTE,
    name: 'estado',
  })
  status: GestionStatus;

  @Column({ type: 'text', nullable: true, name: 'notas' })
  notes: string;

  @CreateDateColumn({ name: 'creado_en' })
  created_at: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  updated_at: Date;
}
