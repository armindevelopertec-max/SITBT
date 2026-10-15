import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Persona } from './persona.entidad';
import { Carrera } from './carrera.entidad';
import { PlanEstudio } from './plan-estudio.entidad';

export enum EstadoEstudiante {
  ACTIVO = 'activo',
  EGRESADO = 'egresado',
  TITULADO = 'titulado',
  CONGELADO = 'congelado',
  BAJA = 'baja',
}

export enum EstadoMatriculaEstudiante {
  PRE_REGISTRO = 'pre_registro',
  VERIFICADO = 'verificado',
  MATRICULADO = 'matriculado',
  EGRESADO = 'egresado',
  RETIRADO = 'retirado',
}

export enum OrigenEstudiante {
  WEB = 'web',
  SECRETARIA = 'secretaria',
}

@Entity('estudiantes')
export class Estudiante {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'personaId' })
  personaId: number;

  @ManyToOne(() => Persona)
  @JoinColumn({ name: 'personaId' })
  persona: Persona;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'numero_titulo_bachiller' })
  numeroTituloBachiller: string;

  @Column({ type: 'date', nullable: true, name: 'fecha_titulo_bachiller' })
  fechaTituloBachiller: Date;

  @Column({ type: 'varchar', length: 10, name: 'gestion_admision' })
  gestionAdmision: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'numero_folder' })
  numeroFolder: string;

  @Column({ type: 'varchar', length: 30, unique: true, name: 'codigo_inscripcion' })
  codigoInscripcion: string;

  @Column({ type: 'varchar', length: 30, nullable: true, name: 'codigo_formulario_01' })
  codigoFormulario01: string;

  @Column({ name: 'carrera_id' })
  carreraId: number;

  @ManyToOne(() => Carrera)
  @JoinColumn({ name: 'carrera_id' })
  carrera: Carrera;

  @Column({ name: 'plan_estudio_id' })
  planEstudioId: number;

  @ManyToOne(() => PlanEstudio)
  @JoinColumn({ name: 'plan_estudio_id' })
  plan_estudio: PlanEstudio;

  @Column({ type: 'date', name: 'fecha_admision' })
  fechaAdmision: Date;

  @Column({ type: 'enum', enum: EstadoEstudiante, default: EstadoEstudiante.ACTIVO, name: 'estado' })
  estado: EstadoEstudiante;

  @Column({ type: 'enum', enum: EstadoMatriculaEstudiante, default: EstadoMatriculaEstudiante.MATRICULADO })
  estadoMatricula: EstadoMatriculaEstudiante;

  @Column({ type: 'enum', enum: OrigenEstudiante, default: OrigenEstudiante.SECRETARIA })
  origen: OrigenEstudiante;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'solicitud_admision_id' })
  solicitudAdmisionId: string;

  @Column({ nullable: true })
  verificadoPor: number;

  @Column({ type: 'timestamp', nullable: true })
  fechaVerificacion: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaPreRegistro: Date;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
