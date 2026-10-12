import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Materia } from './materia.entity';

@Entity('prerequisites')
export class Prerrequisito {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'materia_id' })
  subject_id: number;

  @ManyToOne(() => Materia)
  @JoinColumn({ name: 'materia_id' })
  materia: Materia;

  @Column({ name: 'prerequisite_subject_id' })
  prerequisite_subject_id: number;

  @ManyToOne(() => Materia)
  @JoinColumn({ name: 'prerequisite_subject_id' })
  materia_prerrequisito: Materia;
}
