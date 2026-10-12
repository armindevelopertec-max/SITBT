import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Estudiante } from './estudiante.entity';

export enum Gender {
  M = 'M',
  F = 'F',
}

export enum MaritalStatus {
  SOLTERO = 'Soltera(o)',
  CASADO = 'Casada(o)',
  VIUDO = 'Viuda(o)',
  DIVORCIADO = 'Divorciada(o)',
}

export enum BloodType {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
}

export enum PersonStatus {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
}

@Entity('personas')
export class Persona {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  ci: string;

  @Column({ type: 'varchar', length: 100, name: 'nombres' })
  names: string;

  @Column({ type: 'varchar', length: 50, name: 'apellido_paterno' })
  lastname_paternal: string;

  @Column({ type: 'varchar', length: 50, name: 'apellido_materno' })
  lastname_maternal: string;

  @Column({ type: 'date', name: 'fecha_nacimiento' })
  birthdate: Date;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'lugar_nacimiento' })
  birthplace: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'lugar_nacimiento_otro' })
  birthplace_other: string;

  @Column({ type: 'enum', enum: Gender, name: 'genero' })
  gender: Gender;

  @Column({ type: 'enum', enum: MaritalStatus, nullable: true, name: 'estado_civil' })
  marital_status: MaritalStatus;

  @Column({ type: 'varchar', length: 50, default: 'Boliviana', name: 'nacionalidad' })
  nationality: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'nacionalidad_otra' })
  nationality_other: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'doble_nacionalidad' })
  dual_nationality: string;

  @Column({ type: 'varchar', length: 30, nullable: true, name: 'numero_pasaporte' })
  passport_number: string;

  @Column({ type: 'enum', enum: BloodType, nullable: true, name: 'tipo_sangre' })
  blood_type: BloodType;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'discapacidad' })
  disability: string;

  @Column({ type: 'varchar', length: 30, nullable: true, name: 'numero_libreta_militar' })
  military_book_number: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'lengua_materna' })
  mother_tongue: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'telefono' })
  phone: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'correo' })
  email: string;

  @Column({ type: 'varchar', length: 200, nullable: true, name: 'direccion' })
  address: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'foto_url' })
  photo_url: string;

  @Column({ type: 'enum', enum: PersonStatus, default: PersonStatus.ACTIVO, name: 'estado' })
  status: PersonStatus;

  @OneToMany(() => Estudiante, (estudiante) => estudiante.persona)
  estudiantes: Estudiante[];

  @CreateDateColumn({ name: 'creado_en' })
  created_at: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  updated_at: Date;
}
