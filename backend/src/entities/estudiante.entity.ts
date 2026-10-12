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
import { Persona } from './persona.entity';
import { Carrera } from './carrera.entity';
import { PlanEstudio } from './plan-estudio.entity';

export enum EstadoEstudiante {
  ACTIVO = 'activo',
  EGRESADO = 'egresado',
  TITULADO = 'titulado',
  CONGELADO = 'congelado',
  BAJA = 'baja',
}

export enum StudentMatriculaStatus {
  PRE_REGISTRO = 'pre_registro',
  VERIFICADO = 'verificado',
  MATRICULADO = 'matriculado',
  EGRESADO = 'egresado',
  RETIRADO = 'retirado',
}

export enum StudentOrigin {
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
  bachelor_titulo_numero: string;

  @Column({ type: 'fecha', nullable: true, name: 'fecha_titulo_bachiller' })
  bachelor_titulo_fecha: Date;

  @Column({ type: 'varchar', length: 10, name: 'gestion_admision' })
  gestionAdmision: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'numero_folder' })
  folder_numero: string;

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

  @Column({ type: 'fecha', name: 'fecha_admision' })
  fechaAdmision: Date;

  @Column({ type: 'enum', enum: EstadoEstudiante, default: EstadoEstudiante.ACTIVO, name: 'estado' })
  estado: EstadoEstudiante;

  @Column({ type: 'enum', enum: StudentMatriculaStatus, default: StudentMatriculaStatus.MATRICULADO })
  estado_matricula: StudentMatriculaStatus;

  @Column({ type: 'enum', enum: StudentOrigin, default: StudentOrigin.SECRETARIA })
  origen: StudentOrigin;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'solicitud_admision_id' })
  solicitudAdmisionId: string;

  @Column({ nullable: true })
  verificado_por: number;

  @Column({ type: 'timestamp', nullable: true })
  fecha_verificacion: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_pre_registro: Date;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
