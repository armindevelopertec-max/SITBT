import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Grupo } from './grupo.entity';
import { Estudiante } from './estudiante.entity';

@Entity('group_students')
export class GrupoEstudiante {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  group_id: number;

  @ManyToOne(() => Grupo)
  @JoinColumn({ name: 'group_id' })
  grupo: Grupo;

  @Column()
  student_id: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'student_id' })
  estudiante: Estudiante;

  @CreateDateColumn({ name: 'enrolled_at' })
  enrolled_at: Date;
}
