import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Carrera } from './carrera.entity';
import { Usuario } from './usuario.entity';

export enum Gender {
  M = 'M',
  F = 'F',
}

export enum AdmissionStatus {
  PENDIENTE = 'pendiente',
  VERIFICADO = 'verificado',
  RECHAZADO = 'rechazado',
  CONVERTIDO = 'convertido',
}

export enum AdmissionOrigin {
  WEB = 'web',
  SECRETARIA = 'secretaria',
}

@Entity('admission_requests')
export class AdmissionRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  names: string;

  @Column({ name: 'apellido_paterno', type: 'varchar', length: 100, nullable: true })
  lastname_paternal: string;

  @Column({ name: 'apellido_materno', type: 'varchar', length: 100, nullable: true })
  lastname_maternal: string;

  @Column({ type: 'varchar', length: 20 })
  ci: string;

  @Column({ name: 'fecha_nacimiento', type: 'date' })
  birthdate: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  birthplace: string;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  marital_status: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nationality: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  address: string;

  @Column({ name: 'nombre_tutor', type: 'varchar', length: 100, nullable: true })
  nombreTutor: string;

  @Column({ name: 'ci_tutor', type: 'varchar', length: 20, nullable: true })
  ciTutor: string;

  @Column({ name: 'telefono_tutor', type: 'varchar', length: 20, nullable: true })
  telefonoTutor: string;

  @Column({ nullable: true })
  carrera_id: number;

  @ManyToOne(() => Carrera)
  @JoinColumn({ name: 'carrera_id' })
  carrera: Carrera;

  @Column({ type: 'enum', enum: AdmissionStatus, default: AdmissionStatus.PENDIENTE })
  estado: AdmissionStatus;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ nullable: true })
  verificado_por: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'verificado_por' })
  verificador: Usuario;

  @Column({ name: 'fecha_verificacion', type: 'timestamp', nullable: true })
  fechaVerificacion: Date;

  @Column({ type: 'enum', enum: AdmissionOrigin, default: AdmissionOrigin.WEB })
  origen: AdmissionOrigin;

  @Column({ name: 'documento_ci_path', type: 'varchar', length: 255, nullable: true })
  documentoCiPath: string;

  @Column({ name: 'certificado_bachiller_path', type: 'varchar', length: 255, nullable: true })
  certificadoBachillerPath: string;

  @Column({ name: 'foto_path', type: 'varchar', length: 255, nullable: true })
  fotoPath: string;

  @Column({ nullable: true })
  converted_student_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
