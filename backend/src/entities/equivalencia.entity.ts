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

@Entity('equivalencias')
export class Equivalencia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'materia_origen_id' })
  source_materiaId: number;

  @ManyToOne(() => Materia)
  @JoinColumn({ name: 'materia_origen_id' })
  materia_origen: Materia;

  @Column({ name: 'materia_destino_id' })
  target_materiaId: number;

  @ManyToOne(() => Materia)
  @JoinColumn({ name: 'materia_destino_id' })
  materia_destino: Materia;

  @Column({ type: 'enum', enum: EquivalenceType , name: 'tipo' })
  tipo: EquivalenceType;

  @Column({ type: 'text', nullable: true, name: 'notas' })
  notas: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}
