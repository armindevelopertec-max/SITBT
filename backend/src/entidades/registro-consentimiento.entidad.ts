import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Estudiante } from './estudiante.entidad';
import { Usuario } from './usuario.entidad';

export enum TipoConsentimiento {
  ACCESO = 'acceso',
  RECTIFICACION = 'rectificacion',
  ELIMINACION = 'eliminacion',
}

@Entity('registros_consentimiento')
export class RegistroConsentimiento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  estudianteId: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @Column({ type: 'varchar', length: 20, name: 'versionPolitica' })
  versionPolitica: string;

  @Column({ type: 'timestamp', name: 'fechaConsentimiento' })
  fechaConsentimiento: Date;

  @Column({ type: 'varchar', length: 45, nullable: true, name: 'ipConsentimiento' })
  ipConsentimiento: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'nombreTutor' })
  nombreTutor: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'ciTutor' })
  ciTutor: string;

  @Column({ type: 'text', nullable: true, name: 'firmaBase64' })
  firmaBase64: string;

  @Column({ type: 'boolean', default: false, name: 'consentimientoTutor' })
  consentimientoTutor: boolean;

  @Column({ type: 'enum', enum: TipoConsentimiento, nullable: true, name: 'derechoEjercido' })
  derechoEjercido: TipoConsentimiento;

  @Column({ type: 'timestamp', nullable: true, name: 'derechoFecha' })
  derechoFecha: Date;

  @Column({ nullable: true })
  registradoPor: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ })
  registrador: Usuario;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
