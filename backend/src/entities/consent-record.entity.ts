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

export enum ConsentType {
  ACCESS = 'access',
  RECTIFICATION = 'rectification',
  DELETION = 'deletion',
}

@Entity('consent_records')
export class ConsentRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  estudiante_id: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @Column({ type: 'varchar', length: 20 })
  versionPolitica: string;

  @Column({ type: 'timestamp' })
  fechaConsentimiento: Date;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipConsentimiento: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nombreTutor: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  ciTutor: string;

  @Column({ type: 'text', nullable: true })
  firmaBase64: string;

  @Column({ type: 'boolean', default: false })
  consentimientoTutor: boolean;

  @Column({ type: 'enum', enum: ConsentType, nullable: true })
  derechoEjercido: ConsentType;

  @Column({ type: 'timestamp', nullable: true })
  derechoFecha: Date;

  @Column({ nullable: true })
  registrado_por: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'registrado_por' })
  registrador: Usuario;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
