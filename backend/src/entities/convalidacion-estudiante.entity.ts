import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Estudiante } from './estudiante.entity';
import { Equivalencia } from './equivalencia.entity';
import { Materia } from './materia.entity';
import { Usuario } from './usuario.entity';

export enum TipoConvalidacion {
  PLAN_MIGRATION = 'plan_migration',
  EXTERNAL_TRANSFER = 'external_transfer',
  TRANSITABILIDAD = 'transitabilidad',
}

export enum EstadoConvalidacion {
  PENDIENTE = 'pendiente',
  APROBADA = 'aprobada',
  RECHAZADA = 'rechazada',
}

@Entity('convalidaciones_estudiante')
export class ConvalidacionEstudiante {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'estudiante_id' })
  estudianteId: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @Column({ nullable: true, name: 'equivalencia_id' })
  equivalenciaId: number;

  @ManyToOne(() => Equivalencia)
  @JoinColumn({ name: 'equivalencia_id' })
  equivalencia: Equivalencia;

  @Column({ name: 'materia_destino_id' })
  target_materiaId: number;

  @ManyToOne(() => Materia)
  @JoinColumn({ name: 'materia_destino_id' })
  materia_destino: Materia;

  @Column({ type: 'enum', enum: TipoConvalidacion , name: 'tipo' })
  tipo: TipoConvalidacion;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'numero_resolucion' })
  resolution_numero: string;

  @Column({ type: 'fecha', nullable: true, name: 'fecha_resolucion' })
  fechaResolucion: Date;

  @Column({ type: 'enum', enum: EstadoConvalidacion, default: EstadoConvalidacion.PENDIENTE , name: 'estado' })
  estado: EstadoConvalidacion;

  @Column({ nullable: true, name: 'aprobado_por' })
  aprobadoPor: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ })
  aprobador: Usuario;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
