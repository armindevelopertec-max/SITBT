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

@Entity('grupos_historial')
export class GrupoHistorial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'grupo_id' })
  grupoId: number;

  @ManyToOne(() => Grupo)
  @JoinColumn({ name: 'grupo_id' })
  grupo: Grupo;

  @Column({ nullable: true, name: 'estudiante_id' })
  estudianteId: number | null;

  @ManyToOne(() => Estudiante, { nullable: true })
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @Column({ type: 'varchar', length: 30, name: 'accion' })
  accion: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'detalle' })
  detalle: string | null;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}
