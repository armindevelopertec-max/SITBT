import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Grupo } from './grupo.entidad';
import { Estudiante } from './estudiante.entidad';

@Entity('grupos_estudiantes')
export class GrupoEstudiante {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'grupo_id' })
  grupoId: number;

  @ManyToOne(() => Grupo)
  @JoinColumn({ name: 'grupo_id' })
  grupo: Grupo;

  @Column({ })
  estudianteId: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ })
  estudiante: Estudiante;

  @CreateDateColumn({ name: 'inscrito_en' })
  inscritoEn: Date;
}
