import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Estudiante } from './estudiante.entidad';

export enum Genero {
  M = 'M',
  F = 'F',
}

export enum EstadoCivil {
  SOLTERO = 'Soltera(o)',
  CASADO = 'Casada(o)',
  VIUDO = 'Viuda(o)',
  DIVORCIADO = 'Divorciada(o)',
}

export enum TipoSangre {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
}

export enum EstadoPersona {
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

  @Column({ type: 'date', name: 'fecha_nacimiento' })
  fechaNacimiento: Date;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'lugar_nacimiento' })
  lugarNacimiento: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'lugar_nacimiento_otro' })
  lugarNacimientoOtro: string;

  @Column({ type: 'enum', enum: Genero, name: 'genero' })
  genero: Genero;

  @Column({ type: 'enum', enum: EstadoCivil, nullable: true, name: 'estadoCivil' })
  estadoCivil: EstadoCivil;

  @Column({ type: 'varchar', length: 50, default: 'Boliviana', name: 'nacionalidad' })
  nacionalidad: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'nacionalidadOtra' })
  nacionalidadOtra: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'dobleNacionalidad' })
  dobleNacionalidad: string;

  @Column({ type: 'varchar', length: 30, nullable: true, name: 'numeroPasaporte' })
  numeroPasaporte: string;

  @Column({ type: 'enum', enum: TipoSangre, nullable: true, name: 'tipoSangre' })
  tipoSangre: TipoSangre;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'discapacidad' })
  discapacidad: string;

  @Column({ type: 'varchar', length: 30, nullable: true, name: 'numeroLibretaMilitar' })
  numeroLibretaMilitar: string;

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

  @Column({ type: 'enum', enum: EstadoPersona, default: EstadoPersona.ACTIVO, name: 'estado' })
  estado: EstadoPersona;

  @OneToMany(() => Estudiante, (estudiante) => estudiante.persona)
  estudiantes: Estudiante[];

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
