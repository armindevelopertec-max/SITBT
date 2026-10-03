import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  AfterLoad,
} from 'typeorm';
import { Carrera } from './carrera.entity';

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

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre: string;

  @Column({ name: 'apellido_paterno', type: 'varchar', length: 100, nullable: true })
  apellido_paterno: string;

  @Column({ name: 'apellido_materno', type: 'varchar', length: 100, nullable: true })
  apellido_materno: string;

  names: string;
  lastname_paternal: string;
  lastname_maternal: string;

  @Column({ type: 'varchar', length: 20 })
  ci: string;

  @Column({ name: 'fecha_nacimiento', type: 'date' })
  birthdate: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  birthplace: string;

  @Column({ name: 'birthplace_other', type: 'varchar', length: 100, nullable: true })
  birthplace_other: string;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  marital_status: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nationality: string;

  @Column({ name: 'nationality_other', type: 'varchar', length: 100, nullable: true })
  nationality_other: string;

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

  @Column({ type: 'varchar', length: 20, default: 'pendiente' })
  estado: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ name: 'verificado_por', type: 'int', nullable: true })
  verificado_por: number | null;

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

  @AfterLoad()
  setVirtualFields() {
    if (this.nombre) this.names = this.nombre;
    if (this.apellido_paterno) this.lastname_paternal = this.apellido_paterno;
    if (this.apellido_materno) this.lastname_maternal = this.apellido_materno;
  }
}
