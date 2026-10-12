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
  nombres: string;

  @Column({ type: 'varchar', length: 50, name: 'apellido_paterno' })
  apellidoPaterno: string;

  @Column({ type: 'varchar', length: 50, name: 'apellido_materno' })
  apellidoMaterno: string;

  @Column({ type: 'fecha', name: 'fecha_nacimiento' })
  fechaNacimiento: Date;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'lugar_nacimiento' })
  lugarNacimiento: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'lugar_nacimiento_otro' })
  lugarNacimiento_other: string;

  @Column({ type: 'enum', enum: Gender, name: 'genero' })
  genero: Gender;

  @Column({ type: 'enum', enum: MaritalStatus, nullable: true, name: 'estadoCivil' })
  marital_estado: MaritalStatus;

  @Column({ type: 'varchar', length: 50, default: 'Boliviana', name: 'nacionalidad' })
  nacionalidad: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'nacionalidadOtra' })
  nacionalidad_other: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'dobleNacionalidad' })
  dual_nacionalidad: string;

  @Column({ type: 'varchar', length: 30, nullable: true, name: 'numeroPasaporte' })
  passport_numero: string;

  @Column({ type: 'enum', enum: BloodType, nullable: true, name: 'tipoSangre' })
  tipoSangre: BloodType;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'discapacidad' })
  discapacidad: string;

  @Column({ type: 'varchar', length: 30, nullable: true, name: 'numeroLibretaMilitar' })
  military_book_numero: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'lenguaMaterna' })
  lenguaMaterna: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'telefono' })
  telefono: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'correo' })
  correo: string;

  @Column({ type: 'varchar', length: 200, nullable: true, name: 'direccion' })
  direccion: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'foto_url' })
  fotoUrl: string;

  @Column({ type: 'enum', enum: PersonStatus, default: PersonStatus.ACTIVO, name: 'estado' })
  estado: PersonStatus;

  @OneToMany(() => Estudiante, (estudiante) => estudiante.persona)
  estudiantes: Estudiante[];

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
