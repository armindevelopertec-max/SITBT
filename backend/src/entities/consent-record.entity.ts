import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Estudiante } from './estudiante.entity';
import { Usuario } from './usuario.entity';

export enum TipoConsentimiento {
  ACCESS = 'access',
  RECTIFICATION = 'rectification',
  DELETION = 'deletion',
}

@Entity('registros_consentimiento')
export class ConsentRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  student_id: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @Column({ type: 'varchar', length: 20, name: 'version_politica' })
  versionPolitica: string;

  @Column({ type: 'timestamp', name: 'fecha_consentimiento' })
  fechaConsentimiento: Date;

  @Column({ type: 'varchar', length: 45, nullable: true, name: 'ip_consentimiento' })
  ipConsentimiento: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'nombre_tutor' })
  nombreTutor: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'ci_tutor' })
  ciTutor: string;

  @Column({ type: 'text', nullable: true, name: 'firma_base64' })
  firmaBase64: string;

  @Column({ type: 'boolean', default: false, name: 'consentimiento_tutor' })
  consentimientoTutor: boolean;

  @Column({ type: 'enum', enum: TipoConsentimiento, nullable: true, name: 'derecho_ejercido' })
  derechoEjercido: TipoConsentimiento;

  @Column({ type: 'timestamp', nullable: true, name: 'derecho_fecha' })
  derechoFecha: Date;

  @Column({ nullable: true })
  registered_by: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ })
  registrador: Usuario;

  @CreateDateColumn({ name: 'creado_en' })
  created_at: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  updated_at: Date;
}
