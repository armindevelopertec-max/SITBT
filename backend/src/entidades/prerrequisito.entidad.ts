import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Materia } from './materia.entidad';

@Entity('prerequisites')
export class Prerrequisito {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'materia_id' })
  materiaId: number;

  @ManyToOne(() => Materia)
  @JoinColumn({ name: 'materia_id' })
  materia: Materia;

  @Column({ name: 'prerequisite_materiaId' })
  materiaPrerrequisitoId: number;

  @ManyToOne(() => Materia)
  @JoinColumn({ name: 'prerequisite_materiaId' })
  materiaPrerrequisito: Materia;
}
