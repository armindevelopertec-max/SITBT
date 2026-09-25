import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Materia } from './materia.entity';

export enum EquivalenceType {
  AUTOMATICA = 'automatica',
  MANUAL = 'manual',
}

@Entity('equivalences')
export class Equivalencia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'source_subject_id' })
  source_subject_id: number;

  @ManyToOne(() => Materia)
  @JoinColumn({ name: 'source_subject_id' })
  materia_origen: Materia;

  @Column({ name: 'target_subject_id' })
  target_subject_id: number;

  @ManyToOne(() => Materia)
  @JoinColumn({ name: 'target_subject_id' })
  materia_destino: Materia;

  @Column({ type: 'enum', enum: EquivalenceType })
  type: EquivalenceType;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;
}
