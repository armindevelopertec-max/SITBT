import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Estudiante } from './estudiante.entidad';
import { MateriaImpartida } from './materia-impartida.entidad';

export enum EstadoInscripcionMateria {
  CURSANDO = 'cursando',
  APROBADO = 'aprobado',
  REPROBADO = 'reprobado',
  RETIRADO = 'retirado',
}

/**
 * Inscripción de un estudiante a una materia impartida. Se genera a partir de
 * los estudiantes del grupo y puede administrarse de forma individual.
 */
@Unique('UQ_inscripcion_materia', ['estudianteId', 'materiaImpartidaId'])
@Entity('inscripciones_materia')
export class InscripcionMateria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'estudiante_id' })
  estudianteId: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @Column({ name: 'materia_impartida_id' })
  materiaImpartidaId: number;

  @ManyToOne(() => MateriaImpartida)
  @JoinColumn({ name: 'materia_impartida_id' })
  materiaImpartida: MateriaImpartida;

  @Column({ type: 'varchar', length: 20, default: EstadoInscripcionMateria.CURSANDO })
  estado: EstadoInscripcionMateria;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
