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

@Entity('grupos_estudiantes')
export class GrupoEstudiante {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'grupo_id' })
  group_id: number;

  @ManyToOne(() => Grupo)
  @JoinColumn({ name: 'grupo_id' })
  grupo: Grupo;

  @Column({ })
  student_id: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ })
  estudiante: Estudiante;

  @CreateDateColumn({ name: 'inscrito_en' })
  enrolled_at: Date;
}
