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

@Entity('persons')
export class Persona {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  ci: string;

  @Column({ type: 'varchar', length: 100 })
  names: string;

  @Column({ type: 'varchar', length: 50 })
  lastname_paternal: string;

  @Column({ type: 'varchar', length: 50 })
  lastname_maternal: string;

  @Column({ type: 'date' })
  birthdate: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  birthplace: string;

  @Column({ name: 'birthplace_other', type: 'varchar', length: 100, nullable: true })
  birthplace_other: string;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ type: 'enum', enum: MaritalStatus, nullable: true })
  marital_status: MaritalStatus;

  @Column({ type: 'varchar', length: 50, default: 'Boliviana' })
  nationality: string;

  @Column({ name: 'nationality_other', type: 'varchar', length: 100, nullable: true })
  nationality_other: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  dual_nationality: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  passport_number: string;

  @Column({ type: 'enum', enum: BloodType, nullable: true })
  blood_type: BloodType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  disability: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  military_book_number: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  mother_tongue: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  photo_url: string;

  @Column({ type: 'enum', enum: PersonStatus, default: PersonStatus.ACTIVO })
  status: PersonStatus;

  @OneToMany(() => Estudiante, (estudiante) => estudiante.persona)
  estudiantes: Estudiante[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
