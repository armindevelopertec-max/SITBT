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

export enum StudentStatus {
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

  @Column({ name: 'persona_id' })
  person_id: number;

  @ManyToOne(() => Persona)
  @JoinColumn({ name: 'persona_id' })
  persona: Persona;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'numero_titulo_bachiller' })
  bachelor_title_number: string;

  @Column({ type: 'date', nullable: true, name: 'fecha_titulo_bachiller' })
  bachelor_title_date: Date;

  @Column({ type: 'varchar', length: 10, name: 'gestion_admision' })
  admission_gestion: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'numero_folder' })
  folder_number: string;

  @Column({ type: 'varchar', length: 30, unique: true, name: 'codigo_inscripcion' })
  inscription_code: string;

  @Column({ type: 'varchar', length: 30, nullable: true, name: 'codigo_formulario_01' })
  form01_code: string;

  @Column({ name: 'carrera_id' })
  career_id: number;

  @ManyToOne(() => Carrera)
  @JoinColumn({ name: 'carrera_id' })
  carrera: Carrera;

  @Column({ name: 'plan_estudio_id' })
  study_plan_id: number;

  @ManyToOne(() => PlanEstudio)
  @JoinColumn({ name: 'plan_estudio_id' })
  plan_estudio: PlanEstudio;

  @Column({ type: 'date', name: 'fecha_admision' })
  admission_date: Date;

  @Column({ type: 'enum', enum: StudentStatus, default: StudentStatus.ACTIVO , name: 'estado' })
  status: StudentStatus;

  @Column({ type: 'enum', enum: StudentMatriculaStatus, default: StudentMatriculaStatus.MATRICULADO })
  estado_matricula: StudentMatriculaStatus;

  @Column({ type: 'enum', enum: StudentOrigin, default: StudentOrigin.SECRETARIA })
  origen: StudentOrigin;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'solicitud_admision_id' })
  admission_request_id: string;

  @Column({ nullable: true })
  verificado_por: number;

  @Column({ type: 'timestamp', nullable: true })
  fecha_verificacion: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_pre_registro: Date;

  @CreateDateColumn({ name: 'creado_en' })
  created_at: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  updated_at: Date;
}
