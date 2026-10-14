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

export enum Genero {
  M = 'M',
  F = 'F',
}

export enum EstadoAdmision {
  PENDIENTE = 'pendiente',
  VERIFICADO = 'verificado',
  RECHAZADO = 'rechazado',
  CONVERTIDO = 'convertido',
}

export enum OrigenAdmision {
  WEB = 'web',
  SECRETARIA = 'secretaria',
}

@Entity('solicitudes_admision')
export class SolicitudAdmision {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre: string;

  @Column({ name: 'apellido_paterno', type: 'varchar', length: 100, nullable: true })
  apellidoPaterno: string;

  @Column({ name: 'apellido_materno', type: 'varchar', length: 100, nullable: true })
  apellidoMaterno: string;

  nombres: string;

  @Column({ type: 'varchar', length: 20 })
  ci: string;

  @Column({ type: 'date', name: 'fecha_nacimiento' })
  fechaNacimiento: Date;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'lugar_nacimiento' })
  lugarNacimiento: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'lugar_nacimiento_otro' })
  lugarNacimientoOtro: string;

  @Column({ type: 'enum', enum: Genero, nullable: true, name: 'genero' })
  genero: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'estadoCivil' })
  estadoCivil: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'nacionalidad' })
  nacionalidad: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'nacionalidadOtra' })
  nacionalidadOtra: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'telefono' })
  telefono: string;

  @Column({ type: 'varchar', length: 100, name: 'correo' })
  correo: string;

  @Column({ type: 'varchar', length: 200, nullable: true, name: 'direccion' })
  direccion: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'nombreTutor' })
  nombreTutor: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'ciTutor' })
  ciTutor: string;

  @Column({ name: 'telefono_tutor', type: 'varchar', length: 20, nullable: true })
  telefonoTutor: string;

  @Column({ nullable: true })
  carreraId: number;

  @ManyToOne(() => Carrera)
  @JoinColumn({ name: 'carrera_id' })
  carrera: Carrera;

  @Column({ type: 'varchar', length: 20, default: 'pendiente' })
  estado: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ name: 'verificado_por', type: 'int', nullable: true })
  verificadoPor: number | null;

  @Column({ name: 'fecha_verificacion', type: 'timestamp', nullable: true })
  fechaVerificacion: Date;

  @Column({ type: 'enum', enum: OrigenAdmision, default: OrigenAdmision.WEB })
  origen: OrigenAdmision;

  @Column({ name: 'documento_ci_ruta', type: 'varchar', length: 255, nullable: true })
  documentoCiRuta: string;

  @Column({ name: 'certificado_bachiller_ruta', type: 'varchar', length: 255, nullable: true })
  certificadoBachillerRuta: string;

  @Column({ name: 'foto_ruta', type: 'varchar', length: 255, nullable: true })
  fotoRuta: string;

  @Column({ nullable: true, name: 'converted_estudianteId' })
  estudianteConvertidoId: number;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;

  @AfterLoad()
  setVirtualFields() {
    if (this.nombre) this.nombres = this.nombre;
    if (this.apellidoPaterno) this.apellidoPaterno = this.apellidoPaterno;
    if (this.apellidoMaterno) this.apellidoMaterno = this.apellidoMaterno;
  }
}
