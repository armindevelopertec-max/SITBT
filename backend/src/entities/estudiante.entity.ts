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

@Entity('students')
export class Estudiante {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  person_id: number;

  @ManyToOne(() => Persona)
  @JoinColumn({ name: 'person_id' })
  persona: Persona;

  @Column({ type: 'varchar', length: 50, nullable: true })
  bachelor_title_number: string;

  @Column({ type: 'date', nullable: true })
  bachelor_title_date: Date;

  @Column({ type: 'varchar', length: 10 })
  admission_gestion: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  folder_number: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  inscription_code: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  form01_code: string;

  @Column()
  career_id: number;

  @ManyToOne(() => Carrera)
  @JoinColumn({ name: 'career_id' })
  carrera: Carrera;

  @Column()
  study_plan_id: number;

  @ManyToOne(() => PlanEstudio)
  @JoinColumn({ name: 'study_plan_id' })
  plan_estudio: PlanEstudio;

  @Column({ type: 'date' })
  admission_date: Date;

  @Column({ type: 'enum', enum: StudentStatus, default: StudentStatus.ACTIVO })
  status: StudentStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
